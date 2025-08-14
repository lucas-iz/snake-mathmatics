
/**
 * Generates n additions.
 * @param {number} n
 * @returns an array with n additions.
 */
function generateAdditions(n) {
   let equations = [];
   
   for(let i = 0; i < n; i++) {
      // Highest value that one number can be
      const highestNumber = 10;
      const num1 = randomNumber(highestNumber);
      const num2 = randomNumber(highestNumber);

      // Arguments to be saved
      const equation = `${num1} + ${num2}`;
      const solution = num1 + num2;
      const maxSolution = highestNumber + highestNumber;

      // Equation & Solution
      const toPush = {equation, solution, maxSolution}

      equations.push(toPush);
   }

   return equations;
}

/**
 * Generates n multiplications.
 * @param {number} n
 * @returns an array with n multiplications.
 */
function generateMultiplications(n) {
   let equations = [];
   
   for(let i = 0; i < n; i++) {
      // Highest value that one number can be
      const highestNumber = 10;
      const num1 = randomNumber(highestNumber);
      const num2 = randomNumber(highestNumber);

      // Arguments to be saved
      const equation = `${num1} * ${num2}`;
      const solution = num1 * num2;
      const maxSolution = highestNumber * highestNumber;

      // Equation & Solution
      const toPush = {equation, solution, maxSolution}

      equations.push(toPush);
   }

   return equations;
}

/**
 * Generates n subtractions.
 * @param {number} n
 * @returns an array with n subtractions.
 */
function generateSubtractions(n) {
   let equations = [];
   
   for(let i = 0; i < n; i++) {
      // Highest value that one number can be
      const highestNumber = 10;
      let num1 = randomNumber(highestNumber);
      let num2 = randomNumber(highestNumber);

      // Switch num1 and num2, in case num1 is smaller, such that num1 is always larger than num2
      if(num1 < num2) {
         const temp = num2;
         num2 = num1;
         num1 = temp;
      }

      // Arguments to be saved
      const equation = `${num1} - ${num2}`;
      const solution = num1 - num2;
      const maxSolution = highestNumber;

      // Equation & Solution
      const toPush = {equation, solution, maxSolution}

      equations.push(toPush);
   }

   return equations;
}

/**
 * Generates n divisions.
 * @param {number} n
 * @returns an array with n divisions.
 */
function generateDivisions(n) {
   let equations = [];
   
   for(let i = 0; i < n; i++) {
      // Highest value that one number can be
      const highestNumber = 10;
      const num1 = randomNumber(highestNumber);
      let num2 = randomNumber(highestNumber);

      // No division by zero. Just in case num2 (the divisor) is zero. Shouldn't be, but just to make sure.
      while(num2 == 0) {
         num2 = randomNumber(highestNumber);
      }

      // Arguments to be saved
      const equation = `${num1} / ${num2}`;
      const solution = (num1 / num2).toFixed(1);
      const maxSolution = highestNumber;

      // Equation & Solution
      const toPush = {equation, solution, maxSolution}

      equations.push(toPush);
   }

   return equations;
}

/**
 * Generates n modulo-operations.
 * @param {number} n
 * @returns an array with n modulo-operations.
 */
function generateModulo(n) {
   let equations = [];
   
   for(let i = 0; i < n; i++) {
      // Highest value that one number can be
      const highestNumber = 10;
      const num1 = randomNumber(highestNumber);
      let num2 = randomNumber(highestNumber);

      // No division by zero. Just in case num2 (the divisor) is zero. Shouldn't be, but just to make sure.
      while(num2 == 0) {
         num2 = randomNumber(highestNumber);
      }

      // Arguments to be saved
      const equation = `${num1} % ${num2}`;
      const solution = num1 % num2;
      const maxSolution = highestNumber;

      // Equation & Solution
      const toPush = {equation, solution, maxSolution}

      equations.push(toPush);
   }

   return equations;
}

/** Gets random equation with solution */
function getRandomEquation(allEquations) {
   const randomIndex = randomNumber(allEquations.length-1);
   
   return allEquations[randomIndex];
}

/** Returns a random integer from 1 to max */
function randomNumber(max) {
   return Math.floor(Math.random() * max) + 1;
}

/** Returns a random integer from 1 to max */
function randomDouble(max) {
   const my_min = 0.00000001;
   const my_max = max - 0.00000001;
   return Math.random() * (my_max - my_min) + my_min;
}

// Exports functions for game-script.js to use
export { 
   generateAdditions,
   generateSubtractions,
   generateMultiplications,
   generateDivisions,
   generateModulo,

   getRandomEquation,
   randomNumber,
   randomDouble
};