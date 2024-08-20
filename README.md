firewall-js is a Node.js library that safeguards your codebase with seamless access control based on directory structure.

## Installation

```bash
npm install --save firewall-js
```

## Usage

```js
const firewall = require('firewall-js');
const proxiedObj = firewall.allow(allowedPathsArray, targetObj);
```

By using JavaScript proxies, firewall-js allows only the files specified in `allowedPathsArray` to access any object or function.



As a quick example, take a simple backend application with three layers: **routes &gt; controllers &gt; services**. Each layer has its own directory, and each file in a directory houses a module. The directory listing should look something like this:

```text
> controllers
> routes
v services
   auth.js
   log.js
   user.js
```

If you want all the controller and service modules to have access to a particular service module, it can be done with a single line:

```js
// services/user.js
// ...
const firewall = require('firewall-js');

const userService = {
    hashPassword: function (password) {
        return bcrypt.hash(password, 8);
    },

    getUserByEmail: function (email) {
        return db('user').where('email', email).then(_.head);
    },

    // ...
};

module.exports = firewall.allow(['controllers', 'services'], userService);
```

If you attempt to call, for example, *userService.hashPassword()* from a file in any other directory, an exception will be thrown:

```text
Error: Access denied for hashPassword from /Users/me/my-app/routes/main.js:51:19
```

You can also allow access not just from directories, but from files too. In the following example, only the userProfile controller can access userService, and no one else:

```js
module.exports = firewall.allow(['controllers/userProfile.js'], userService);
```

Having the filesystem structure as the basis of the access control system offers two benefits:

* A clear-cut organization of code with directories acting as layers and files as modules within those layers.
* Permissions that are easy to understand, since most everyone is familiar with how a filesystem works.
