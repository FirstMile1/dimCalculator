// Code Written by Milton Amaya - Firstmile 2024
interface Window {
  Webflow: any; // Declare Webflow on the window object
}

window.Webflow ||= [];
window.Webflow.push(() => {
  console.log('Dimensional Weight Calculator initialized');

  const form = document.querySelector('[fs-element="form"]') as HTMLFormElement;
  const result = document.querySelector('[fs-element="result"]');
  const poundsCheckbox = document.querySelector('.pounds-checkbox') as HTMLInputElement;
  const ouncesCheckbox = document.querySelector('.ounces-checkbox') as HTMLInputElement;

  if (!form || !result || !poundsCheckbox || !ouncesCheckbox) return;

  // Function to validate and parse input values
  const parseInputValue = (value: string | null): number | null => {
    const parsedValue = parseFloat(value || '');
    return isNaN(parsedValue) ? null : parsedValue;
  };

  // Function to format actual weight based on the unit
  const formatActualWeight = (weight: number, isPounds: boolean): string => {
    return isPounds ? `${Math.round(weight)} lbs` : `${Math.round(weight)} oz`;
  };

  // Function to round to the nearest pound
  const roundToNearestPound = (weight: number): number => Math.round(weight);

  // Function to round UP to the nearest pound (used for UPS and FedEx billed weight)
  const roundUpToNearestPound = (weight: number): number => Math.ceil(weight);

  // Function to determine if pounds or ounces are selected
  const getWeightUnit = (): 'lbs' | 'oz' | null => {
    if (poundsCheckbox.checked) return 'lbs';
    if (ouncesCheckbox.checked) return 'oz';
    return null;
  };

  // Function to calculate billed weight for USPS and FM (uses actual weight when ounces are selected)
  const calculateUSPSFirstmileBilledWeight = (actualWeight: number, isOunces: boolean): number => {
    if (isOunces) {
      console.log(`FM/USPS Billed Weight (Ounces Mode): Actual Weight = ${actualWeight} oz`);
      return actualWeight; // Use actual weight when ounces are selected for USPS and Firstmile
    }
    return actualWeight; // Default behavior if not ounces (use actual weight in this case)
  };

  // Function to calculate UPS and FedEx billed weight (uses greater of actual vs dim)
  const calculateUPSFedExBilledWeight = (
    actualWeight: number,
    dimWeight: number,
    isOunces: boolean
  ): number => {
    if (isOunces) {
      actualWeight = actualWeight / 16; // Convert ounces to pounds
      console.log(`UPS/FedEx Billed Weight (Ounces Mode): Actual Weight = ${actualWeight} lbs`);
    }
    return roundUpToNearestPound(Math.max(actualWeight, dimWeight));
  };

  // Event listener for form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const formData = new FormData(form);
    const length = parseInputValue(formData.get('length') as string);
    const width = parseInputValue(formData.get('width') as string);
    const height = parseInputValue(formData.get('height') as string);
    const actualWeightInput = parseInputValue(formData.get('actual-weight') as string);

    const weightUnit = getWeightUnit();

    if (!weightUnit) {
      result.textContent = 'Please select either pounds or ounces for the actual weight.';
      console.log('Error: Invalid weight unit selection. Please choose pounds or ounces.');
      return;
    }

    const isPounds = weightUnit === 'lbs';
    const isOunces = weightUnit === 'oz';

    if (length === null || width === null || height === null || actualWeightInput === null) {
      result.textContent =
        'Please provide valid inputs for length, width, height, and actual weight.';
      console.log('Error: Invalid input values.');
      return;
    }

    if (length < width || length < height) {
      result.textContent = 'Error: Length must be greater than or equal to both height and width.';
      console.error(
        'Validation Error: Length must be greater than or equal to both height and width.'
      );
      return;
    }

    const cubicSize = length * width * height;

    const dimWeightUPS = cubicSize / 139;
    const dimWeightFedEx = cubicSize / 139;

    const billedWeightUSPS = calculateUSPSFirstmileBilledWeight(actualWeightInput, isOunces);
    const billedWeightFirstmile = calculateUSPSFirstmileBilledWeight(actualWeightInput, isOunces);
    const billedWeightUPS = calculateUPSFedExBilledWeight(
      actualWeightInput,
      dimWeightUPS,
      isOunces
    );
    const billedWeightFedEx = calculateUPSFedExBilledWeight(
      actualWeightInput,
      dimWeightFedEx,
      isOunces
    );

    result.textContent = 'Dimensional Weight has been calculated on the table.';

    document.querySelector('#actual-weight-ups')!.textContent = formatActualWeight(
      actualWeightInput,
      isPounds
    );
    document.querySelector('#dim-weight-ups')!.textContent =
      `${roundToNearestPound(dimWeightUPS)} lbs`;
    document.querySelector('#billed-weight-ups')!.textContent = formatActualWeight(
      billedWeightUPS,
      isPounds
    );

    document.querySelector('#actual-weight-fedex')!.textContent = formatActualWeight(
      actualWeightInput,
      isPounds
    );
    document.querySelector('#dim-weight-fedex')!.textContent =
      `${roundToNearestPound(dimWeightFedEx)} lbs`;
    document.querySelector('#billed-weight-fedex')!.textContent = formatActualWeight(
      billedWeightFedEx,
      isPounds
    );

    document.querySelector('#actual-weight-firstmile')!.textContent = formatActualWeight(
      actualWeightInput,
      isPounds
    );
    document.querySelector('#dim-weight-firstmile')!.textContent = 'N/A'; // FM doesn't need dim weight in ounces mode
    document.querySelector('#billed-weight-firstmile')!.textContent = formatActualWeight(
      billedWeightFirstmile,
      isPounds
    );

    document.querySelector('#actual-weight-usps')!.textContent = formatActualWeight(
      actualWeightInput,
      isPounds
    );
    document.querySelector('#dim-weight-usps')!.textContent = 'N/A'; // USPS doesn't need dim weight in ounces mode
    document.querySelector('#billed-weight-usps')!.textContent = formatActualWeight(
      billedWeightUSPS,
      isPounds
    );

    console.log(`Cubic Size: ${cubicSize}`);
    console.log(`Dimensional Weight (UPS): ${roundToNearestPound(dimWeightUPS)} lbs`);
    console.log(`Dimensional Weight (FedEx): ${roundToNearestPound(dimWeightFedEx)} lbs`);
    console.log(`Billed Weight (USPS): ${billedWeightUSPS} oz`);
    console.log(`Billed Weight (Firstmile): ${billedWeightFirstmile} oz`);
    console.log(`Billed Weight (UPS): ${billedWeightUPS} lbs`);
    console.log(`Billed Weight (FedEx): ${billedWeightFedEx} lbs`);
  });

  const updateDisplay = () => {
    const lengthInput = document.querySelector('input[name="length"]') as HTMLInputElement;
    const widthInput = document.querySelector('input[name="width"]') as HTMLInputElement;
    const heightInput = document.querySelector('input[name="height"]') as HTMLInputElement;
    const actualWeightInput = document.querySelector(
      'input[name="actual-weight"]'
    ) as HTMLInputElement;

    const lengthDisplay = document.querySelector('#length-display');
    const widthDisplay = document.querySelector('#width-display');
    const heightDisplay = document.querySelector('#height-display');
    const actualWeightDisplay = document.querySelector('#actual-weight-display');

    lengthDisplay!.textContent = lengthInput.value || '0';
    widthDisplay!.textContent = widthInput.value || '0';
    heightDisplay!.textContent = heightInput.value || '0';
    actualWeightDisplay!.textContent = actualWeightInput.value || '0';

    const weightUnit = getWeightUnit();
    if (!weightUnit) {
      document.querySelector('#billed-weight-usps')!.textContent = 'Please select lbs or oz.';
      return;
    }

    const isPounds = weightUnit === 'lbs';
    const isOunces = weightUnit === 'oz';

    const actualWeight = parseInputValue(actualWeightInput.value);
    if (actualWeight !== null) {
      const formattedActualWeight = formatActualWeight(actualWeight, isPounds);
      document.querySelector('#actual-weight-ups')!.textContent = formattedActualWeight;
      document.querySelector('#actual-weight-fedex')!.textContent = formattedActualWeight;
      document.querySelector('#actual-weight-firstmile')!.textContent = formattedActualWeight;
      document.querySelector('#actual-weight-usps')!.textContent = formattedActualWeight;

      const length = parseInputValue(lengthInput.value);
      const width = parseInputValue(widthInput.value);
      const height = parseInputValue(heightInput.value);
      if (length !== null && width !== null && height !== null) {
        const cubicSize = length * width * height;
        const dimWeightUPS = cubicSize / 139;
        const dimWeightFedEx = cubicSize / 139;

        const billedWeightUSPS = calculateUSPSFirstmileBilledWeight(actualWeight, isOunces);
        const billedWeightFirstmile = calculateUSPSFirstmileBilledWeight(actualWeight, isOunces);
        const billedWeightUPS = calculateUPSFedExBilledWeight(actualWeight, dimWeightUPS, isOunces);
        const billedWeightFedEx = calculateUPSFedExBilledWeight(
          actualWeight,
          dimWeightFedEx,
          isOunces
        );

        document.querySelector('#billed-weight-usps')!.textContent = formatActualWeight(
          billedWeightUSPS,
          isPounds
        );
        document.querySelector('#billed-weight-firstmile')!.textContent = formatActualWeight(
          billedWeightFirstmile,
          isPounds
        );
        document.querySelector('#billed-weight-ups')!.textContent = formatActualWeight(
          billedWeightUPS,
          isPounds
        );
        document.querySelector('#billed-weight-fedex')!.textContent = formatActualWeight(
          billedWeightFedEx,
          isPounds
        );
      }
    } else {
      document.querySelector('#actual-weight-ups')!.textContent = '0';
      document.querySelector('#actual-weight-fedex')!.textContent = '0';
      document.querySelector('#actual-weight-firstmile')!.textContent = '0';
      document.querySelector('#actual-weight-usps')!.textContent = '0';
      document.querySelector('#billed-weight-usps')!.textContent = '0';
      document.querySelector('#billed-weight-firstmile')!.textContent = '0';
      document.querySelector('#billed-weight-ups')!.textContent = '0';
      document.querySelector('#billed-weight-fedex')!.textContent = '0';
      console.log('Error: Invalid actual weight input.');
    }
  };

  document.querySelector('input[name="length"]')!.addEventListener('input', updateDisplay);
  document.querySelector('input[name="width"]')!.addEventListener('input', updateDisplay);
  document.querySelector('input[name="height"]')!.addEventListener('input', updateDisplay);
  document.querySelector('input[name="actual-weight"]')!.addEventListener('input', updateDisplay);
});
