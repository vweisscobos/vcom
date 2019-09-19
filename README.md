# vcom

Set of reusable UI components

## Table of Content

- [Installation](#installation)
- [Components](#components)
  - [Autocomplete](#autocomplete)
  - [Modal](#modal)
  - [Modal Form](#modal-form)
  - [Toaster](#toaster)
  - [Table](#table)
  - [Tip Text](#tip-text)

## Components
### Autocomplete

```javascript

const myAutocomplete = vcom.autocomplete(someElement)
   //   the url of the web service that is going to provide information      
  .setSource('https://someapi.com/resource') 
  .setInitialValue('')   
  .setPlaceholder('Type something')
  //    this will build the query '?param1=value1&param2=value2'
  .setQueryBuilder(term => {
    return { param1: value1, param2: value2 }
  }) 
  //    sets what to do with the array coming from the web service
  .setResponseHandler(item => {
    return {value: item.id, label: item.name}  
  })
  //    set what to do when a there's a match beetwen search and result
  .setOnItemFound(match => {
    console.log(match);
  })
  .setInheritAttributes(true)
  //    render autocomplete on dom and return an object containg vcom autocomplete's methods
  .mount(); 

```

### Modal

```javascript

vcom.modal('Display some message to the user', () => {
  console.log('Do something when user click on ok button');
});

```

### Modal Form

```javascript

vcom.modalForm((values, closeModal) => {
  console.log("Do something when user click on ok button");
  console.log(values); // { username: 'user input', password: 'user input' }
  
  closeModal();
}, [  //  array describing the form fields
  {
    name: 'username',
    type: 'text',
    label: 'Username',
    placeholder: 'Enter with username'
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password',
    placeholder: 'Enter with password'
  }
]);

```

### Toaster

```javascript

const myToaster = vcom.toaster();

myToaster.error('Error message');
myToaster.success('Success message');
myToaster.warning('Warning message');

```

### Table

```javascript

let myTable = vcom.table(
    ['name', 'email', 'phone'],  //  array with the attributes that will be displayed
    ['Name', 'Email', 'Phone Number'],  //  array with the labels of the columns
  )
  .setModel([
    {
      name: 'Vinicius Weiss Cobos',
      email: 'v.weisscobos@gmail.com',
      phone: 5599999999
    },
    {
      name: 'Pablo Mazza',
      email: 'pablomazza@gmail.com',
      phone: 5599999999
    }
  ]);
  
  document.appendChild(myTable.mount());

```

### Tip Text

```javascript

let myInput = document.getElementById('#login-input');

vcom.tipText(myInput, 'Enter with user's username or email'); //  set message for the user

```
