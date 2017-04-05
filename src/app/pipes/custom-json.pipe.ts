import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customJson'
})
export class CustomJsonPipe implements PipeTransform {
  // While Angular has a JSON pipe built in, it only seems to 
  // stringify objects to JSON, and doesn't provide a method
  // to parse JSON back to objects. This pipe was created to 
  // allow both

  transform(value:any, action:string, indent:number=2):any {
    // Assuming the result is null, until the parse/stringify
    // method has been completed successfully
    var result = null;

    if(action == "parse"){
      // JSON -> Object
      // Using a try/catch to prevent errors being throw, but
      // doing nothing to deal with the error (null will just
      // be returned)
      try{
        result = JSON.parse(value);
      } catch(err){}
    } else if(action == "stringify"){
      // Object -> JSON
      // Using a try/catch to prevent errors being throw, but
      // doing nothing to deal with the error (null will just
      // be returned)
      try{
        result = JSON.stringify(value, null, indent);
      } catch(err){}
    }
    
    // Returning the resulting object/JSON to the caller
    return result;
  }
}
