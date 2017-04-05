import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'upperCamelCase'
})
export class UpperCamelCasePipe implements PipeTransform {

  transform(stringVal:string, firstWordOnly:boolean=false): any {
    // Appending an empty string to the string value, to implicitlty
    // cast it to a string, and ensure it is not null
    stringVal += "";

    // Creating an empty string on which to store the result
    var result = "";

    // Determining which words to uppercase based on the boolean value
    // passed to the function i.e. if firstWordOnly is true, then splitting
    // the string at every " " space, and returning only the first word, otherwise
    // splitting the string at every " " space and returning all the words.
    // The result is that words will contain an array of one or more string
    var words = firstWordOnly ? stringVal.split(" ").slice(0, 1) : stringVal.split(" ");
    
    // Looping through all the words (from the array created above)
    for(var word of words){
      // Accessing the first letter of the word, and making it uppercase. Appending the 
      // remaining letters in the word (from index 1 onwards) followed by a space
      // i.e. "laura" would become "Laura". Appending the result to the result string.
      result += word[0].toUpperCase() + word.slice(1) + " ";
    }
    
    // Returning the result to the caller
    return result;
  }

}
