<p align="center">
  <img src="https://raw.githubusercontent.com/ngxs-labs/emitter/master/docs/assets/logo.png">
</p>

---

# NGXS Labs delivery flow

## Description

This skeleton reflects most NGXS Labs related projects. The skeleton provides a homogeneous structure in all projects without conflicts, thus we have no discrepancies.

## Quick start

If you want to create a Labs project - you have to complete further steps.

* First let's clone this repo:
  ```console
  git clone git@github.com:ngxs-labs/skeleton.git PROJECT_NAME
  cd PROJECT_NAME
  ```

* Let's remove the `.git` folder:
  ```console
  rm -rf .git
  ```

* Install dependencies (yarn only):
  ```console
  yarn
  ```

* Create your Labs project by running:
  ```console
  yarn create-project --name PROJECT_NAME
  ```

  For example:
  ```console
  yarn create-project --name dispatch-decorator
  ```

* When you push your changes to the new repo - ask someone to add your project to the `travis` CI.
