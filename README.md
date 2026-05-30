# easy_icons

A lightweight Flutter icon package that exposes Ionicons as easy-to-use `IconData` constants.

## Features

- Includes Ionicons font assets directly in the package.
- Provides typed icon constants via `IonIcons`.
- Works with Flutter `Icon` widgets.
- No additional configuration required beyond adding the package dependency.

## Installation

Add `easy_icons` to your `pubspec.yaml` dependencies:

```yaml
dependencies:
  easy_icons: ^0.0.1
```

Then run:

```bash
dart pub get
```

## Usage

Import the package and use `IonIcons` with Flutter's `Icon` widget:

```dart
import 'package:flutter/material.dart';
import 'package:easy_icons/ionicons.dart';

class ExampleIcon extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return const Icon(
      IonIcons.add,
      size: 32,
      color: Colors.blue,
    );
  }
}
```

You can use any available icon constant, for example:

- `IonIcons.add`
- `IonIcons.addOutline`
- `IonIcons.addSharp`
- `IonIcons.alertCircle`
- `IonIcons.airplane`

## Supported Flutter / Dart versions

- Dart SDK: `^3.12.0`
- Flutter SDK: `>=1.17.0`

## Notes

The package includes the `IonIcons.ttf` font asset and maps each icon constant to the correct font family.

## Repository

https://github.com/farhanfadila1717/easy-icons

## License

See the `LICENSE` file for license details.
