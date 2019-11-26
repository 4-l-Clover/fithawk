import { FormControl, AbstractControl } from '@angular/forms';

export function emailValidator(control: FormControl): {[key: string]: any} {
    var emailRegexp = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;    
    if (control.value && !emailRegexp.test(control.value)) {
        return {invalidEmail: true};
    }
}

export function zipValidator(control: FormControl): {[key: string]: any} {
    var zipRegexp = /^\d{5}$|^\d{5}-\d{4}$/;    
    if (control.value && !zipRegexp.test(control.value)) {
        return {invalidZip: true};
    }
}

export function checkValidator(control: FormControl): any {
    if(control.value != true){
        return {
          "notChecked" : true
        };
    }
  
    return null;
}

export function MatchPassword(AC: AbstractControl) {
    const newPassword = AC.get('password').value // to get value in input tag
    const confirmPassword = AC.get('confirm').value // to get value in input tag
     if(newPassword != confirmPassword) {
         console.log('false');
         AC.get('confirm').setErrors( { MatchPassword: true } )
     } else {
         console.log('true')
         AC.get('confirm').setErrors(null);
     }
 }