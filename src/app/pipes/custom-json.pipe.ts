import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customJson'
})
export class CustomJsonPipe implements PipeTransform {

  transform(value:any, action:string, indent:number=2):any {
    var result = null;

    if(action == "parse"){
      try{
        result = JSON.parse(value);
      } catch(err){}
    } else if(action == "stringify"){
      try{
        result = JSON.stringify(value, null, indent);
      } catch(err){}
    }
    
    return result;
  }


}
