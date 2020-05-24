# opinionated-schematics

An opinionated set of schematics for Angular and NestJS.

There are no settings/configuration and it won't respect the options set in your angular/workspace.json.

This is by design, hence it being opinionated.

## Installation

Install as part of your project in the dev dependancies

```
npm install -D opinionated-schematics
```

## Usage

You will need to add a reference in your angular/workspace.json.

You can add the the library directly to the cli.defaultCollection property

```
"cli": {"defaultCollection": "opinionated-schematics"}
```

Or a more flexible approach is to create a collection.json and point the cli.defaultCollection property to that json file

```
"cli": {"defaultCollection": "./collection.json"}
```

Using a collection.json means that you can use more than one custom schematic collection.

The collection.json should look like the below

```
{
  "extends": ["opinionated-schematics"],
  "schematics": {}
}
```

Note that order is important. If there are any schematics that share the same names from the individual packages, only the ones from the last package will be used

## Currently implemented Schematics

### Angular

- [Component](./documentation/angular/COMPONENT.md)
- [Module](./documentation/angular/MODULE.md)

### Nest

- [Controller](./documentation/nest/CONTROLLER.md)
