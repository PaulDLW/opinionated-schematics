# Nest Controller

This will create a Nest Controller

## Properties

| Name         | Type    | Description                                                                  | Required |
| ------------ | ------- | ---------------------------------------------------------------------------- | -------- |
| projectName  | string  | The name of the project. Leave blank to use the default project              | true     |
| path         | string  | The path at which to create the component file, relative to the project root | true     |
| name         | string  | The name of the component                                                    | true     |
| moduleName   | string  | The Module to add the controller to. Leave blank to find the closest module  | true     |
| moduleExport | boolean | When true, the declaring Module exports this controller                      | true     |
