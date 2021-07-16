# Builder

Building the project as part of a workflow may help to create mind-space and focus on the project itself.

Use [Unity - Builder ](https://github.com/marketplace/actions/unity-builder)
to automatically build Unity projects for different platforms.

## Basic setup

By default, the enabled scenes from the project's settings will be built.

Create or edit the file called `.github/workflows/main.yml` and add a job to it.

#### Personal License

Personal licenses require a one-time manual activation step (per unity version).

Make sure you
[acquire and activate](https://github.com/marketplace/actions/unity-request-activation-file)
your license file and add it as a secret.

Then, define the build step as follows:

```yaml
- uses: game-ci/unity-builder@v2
  env:
    UNITY_LICENSE: ${{ secrets.UNITY_LICENSE }}
  with:
    targetPlatform: WebGL
```

#### Professional license

Make sure you have set up these variables in the activation step.

- `UNITY_EMAIL` (should contain the email address for your Unity account)
- `UNITY_PASSWORD` (the password that you use to login to Unity)
- `UNITY_SERIAL` (the serial provided by Unity)

Define the build step as follows:

```yaml
- uses: game-ci/unity-builder@v2
  env:
    UNITY_EMAIL: ${{ secrets.UNITY_EMAIL }}
    UNITY_PASSWORD: ${{ secrets.UNITY_PASSWORD }}
    UNITY_SERIAL: ${{ secrets.UNITY_SERIAL }}
  with:
    targetPlatform: WebGL
```

That is all you need to build your project.

NOTE: Issues have been observed when using a `UNITY_PASSWORD` with special characters.
It is recommended to use a password without any special characters (mixed-case alphanumeric characters only).

## Storing the build

To be able to access your built files,
they need to be uploaded as artifacts.
To do this it is recommended to use Github Actions official
[upload artifact action](https://github.com/marketplace/actions/upload-artifact)
after any build action.

By default, Builder outputs it's builds to a folder named `build`.

Example:

```yaml
- uses: actions/upload-artifact@v2
  with:
    name: Build
    path: build
```

Builds can now be downloaded as Artifacts in the Actions tab.

## Caching

In order to make builds run faster, you can cache Library files from previous
builds. To do so simply add Github Actions official
[cache action](https://github.com/marketplace/actions/cache) before any unity steps.

Example:

```yaml
- uses: actions/cache@v2
  with:
    path: path/to/your/project/Library
    key: Library-MyProjectName-TargetPlatform
    restore-keys: |
      Library-MyProjectName-
      Library-
```

This simple addition could speed up your build by more than 50%.

## Configuration options

Below options can be specified under `with:` for the `unity-builder` action.

#### projectPath

Specify the path to your Unity project to be built.
The path should be relative to the root of your project.

_**required:** `false`_
_**default:** `<your project root>`_

#### unityVersion

Version of Unity to use for building the project.
Use "auto" to get from your ProjectSettings/ProjectVersion.txt

_**required:** `false`_
_**default:** `auto`_

#### targetPlatform

Platform that the build should target.

Must be one of the [allowed values](https://docs.unity3d.com/ScriptReference/BuildTarget.html) listed in the Unity scripting manual.

_**required:** `true`_

#### buildName

Name of the build. Also the folder in which the build will be stored within `buildsPath`.

_**required:** `false`_
_**default:** `<build_target>`_

#### buildsPath

Path where the builds should be stored.

In this folder a folder will be created for every targetPlatform.

_**required:** `false`_
_**default:** `build`_

#### buildMethod

Custom command to run your build.

There are two conditions for a custom buildMethod:

- Must reference a valid path to a `static` method.
- The class must reside in the `Assets/Editor` directory (or in an Editor Assembly).

Example:

```yaml
- uses: game-ci/unity-builder@v2
  with:
    buildMethod: EditorNamespace.BuilderClassName.StaticBuildMethod
```

To get started with a modified version of the default Unity Builder build script, you can copy [BuildScript.cs](https://github.com/game-ci/documentation/blob/main/example/BuildScript.cs) to your `Assets/Editor/UnityBuilderAction` directory and reference it:

```yaml
- uses: game-ci/unity-builder@v2
  with:
    buildMethod: UnityBuilderAction.BuildScript.Build
```

_**required:** `false`_
_**default:** Built-in script that will run a build out of the box._

#### versioning

Configure a specific versioning strategy

```yaml
- uses: game-ci/unity-builder@v2
  with:
    versioning: Semantic
```

Find the available strategies below:

##### Semantic

Versioning out of the box! **(recommended)**

> Compatible with **all platforms**.  
> Does **not** modify your repository.  
> Requires **zero configuration**.

How it works:

> Generates a version based on [semantic versioning](https://semver.org/).  
> Follows `<major>.<minor>.<patch>` for example `0.17.2`.  
> The latest tag dictates `<major>.<minor>` (defaults to 0.0 for no tag).  
> The number of commits (since the last tag, if any) is used for `<patch>`.

No configuration required.

##### Tag

Generates the version based on the latest git tag. For example `0.17.2` will
generate the version `0.17.2`. A leading "v" is stripped, so a version of
`v1.3.3` will generate a version of `1.3.3`.

> Compatible with **all platforms**.
> Does **not** modify your repository.

##### Custom

Allows specifying a custom version in the `version` field. **(advanced users)**

> This strategy is useful when your project or pipeline has some kind of orchestration
> that determines the versions.

##### None

No version will be set by Builder. **(not recommended)**

> Not recommended unless you generate a new version in a pre-commit hook. Manually
> setting versions is error-prone.

#### androidVersionCode

Configure the android `versionCode`.

When not specified, the version code is generated from the version using the `major * 1000000 + minor * 1000 + patch` scheme;

#### androidAppBundle

Set this flag to `true` to build '.aab' instead of '.apk'.

```yaml
- uses: game-ci/unity-builder@v2
  with:
    androidAppBundle: true
    androidKeystoreName: user.keystore
    androidKeystoreBase64: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}
    androidKeystorePass: ${{ secrets.ANDROID_KEYSTORE_PASS }}
    androidKeyaliasName: ${{ secrets.ANDROID_KEYALIAS_NAME }}
    androidKeyaliasPass: ${{ secrets.ANDROID_KEYALIAS_PASS }}
```

You should also set all the Android Keystore options (see below).

_**required:** `false`_
_**default:** `false`_

#### androidKeystoreName

Configure the android `keystoreName`. Must be provided if configuring the below keystore options.

For this to take effect, you must enable `Custom Keystore` in your
[Android Player settings](https://docs.unity3d.com/Manual/class-PlayerSettingsAndroid.html).
The default build script overrides the other keystore settings with these keystore options.

_**required:** `false`_
_**default:** `""`_

#### androidKeystoreBase64

Configure the base64 contents of the android keystore file. You should get this with `base64 $androidKeystoreName`

The contents will be decoded from base64 using `echo $androidKeystoreBase64 | base64 --decode > $projectPath/$androidKeystoreName`

It is recommended to use [GitHub Secrets](https://docs.github.com/en/actions/reference/encrypted-secrets).

_**required:** `false`_
_**default:** `""`_

#### androidKeystorePass

Configure the android `keystorePass`. Recommended to use GitHub Secrets.

_**required:** `false`_
_**default:** `""`_

#### androidKeyaliasName

Configure the android `keyaliasName`. Recommended to use GitHub Secrets.

_**required:** `false`_
_**default:** `""`_

#### androidKeyaliasPass

Configure the android `keyaliasPass`. Recommended to use GitHub Secrets.

_**required:** `false`_
_**default:** `""`_

#### allowDirtyBuild

Allows the branch of the build to be dirty, and still generate the build.

```yaml
- uses: game-ci/unity-builder@v2
  with:
    allowDirtyBuild: true
```

Note that it is generally bad practice to modify your branch
in a CI Pipeline. However there are exceptions where this might
be needed. (use with care).

_**required:** `false`_
_**default:** `false`_

#### customParameters

Custom parameters to configure the build.

Parameters must start with a hyphen (`-`) and may be followed by a value (without hyphen).

Parameters without a value will be considered booleans (with a value of true).

```yaml
- uses: game-ci/unity-builder@v2
  with:
    customParameters: -profile SomeProfile -someBoolean -someValue exampleValue
```

_**required:** `false`_
_**default:** `""`_

#### customImage

Specific docker image that should be used for building the project.

```yaml
- uses: game-ci/unity-builder@v2
  with:
    customImage: 'unityci/editor:2020.1.14f1-base-0'
```

_**required:** `false`_
_**default:** `""`_

## Outputs

Below are outputs that can be accessed by using `${{ steps.myBuildStep.outputs.outputName }}`, where `myBuildStep` is the id
of the Builder step, and `outputName` is the name of the output.

#### buildVersion

Returns the version that was generated by Builder, following the strategy configured for `versioning`.

```yaml
- uses: game-ci/unity-builder@v2
  id: myBuildStep
- run: echo 'Project Version: ${{ steps.myBuildStep.outputs.buildVersion }}'
```

## Private Github repositories

If you use private git repository in your packages/manifest.json, you need to create SSH pub/private keys for your project and then add to the `webfactory/ssh-agent`

- Generate public,private key for github's SSH using [this instruction](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent#generating-a-new-ssh-key) and make sure that you you use `git@github.com:USER/PROJECT.git` instead of email for `-C` parameter because we're going to use it as deploy key for a single project and `webfactory/ssh-agent` going to use that for checking which repository this key is related to .
- Add the public_key to Deploy settings of your private git repository ( https://github.com/USER/PROJECT/settings/keys)
- Add private_key to Github secrets of the project that you want to build (https://github.com/USER/PROJECT/settings/secrets/actions)
  (key name should be SSH_PRIVATE_KEY )
- Finally, add `webfactory/ssh-agent` to your Github action :

```yaml
name: Accessing private repos
runs-on: ubuntu-latest
steps:
  - uses: actions/checkout@v2
  - uses: webfactory/ssh-agent@v0.5.2
    with:
      ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
  - uses: game-ci/unity-builder@v2
    with:
      sshAgent: ${{ env.SSH_AUTH_SOCK }}
```

## UPM Authentication using .upmconfig.toml

Unity requires an .upmconfig.toml to exist in the home directory to authenticate and download packages from private UPM registries.
To create this file, first create the `/home/runner/work/_temp/_github_home` directory, and then create the .upmconfig.toml file inside that directory.
This action must be done before running the game-ci/unity-builder@v2 action.

```yaml
- name: Create .upmconfig.toml UPM authentication file
  run: |
    mkdir /home/runner/work/_temp/_github_home
    cd /home/runner/work/_temp/_github_home
    echo "[npmAuth.\"https://upm.example.com\"]" >> .upmconfig.toml
    echo "alwaysAuth = true" >> .upmconfig.toml
    echo "token = \"${{ secrets.NPM_TOKEN }}\"" >> .upmconfig.toml
```

## Complete example

A complete workflow that builds every available platform could look like this:

```yaml
name: Build project

on: [push, pull_request]

jobs:
  buildForAllSupportedPlatforms:
    name: Build for ${{ matrix.targetPlatform }}
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        targetPlatform:
          - StandaloneOSX # Build a macOS standalone (Intel 64-bit).
          - StandaloneWindows # Build a Windows standalone.
          - StandaloneWindows64 # Build a Windows 64-bit standalone.
          - StandaloneLinux64 # Build a Linux 64-bit standalone.
          - iOS # Build an iOS player.
          - Android # Build an Android .apk standalone app.
          - WebGL # WebGL.
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
          lfs: true
      - uses: actions/cache@v2
        with:
          path: Library
          key: Library-${{ matrix.targetPlatform }}
          restore-keys: Library-
      - uses: game-ci/unity-builder@v2
        env:
          UNITY_LICENSE: ${{ secrets.UNITY_LICENSE }}
        with:
          targetPlatform: ${{ matrix.targetPlatform }}
      - uses: actions/upload-artifact@v2
        with:
          name: Build-${{ matrix.targetPlatform }}
          path: build/${{ matrix.targetPlatform }}
```
