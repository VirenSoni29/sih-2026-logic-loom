**Only work on a single feature at a time.**

## For Example:
To start a task:
```[bash]
git checkout dev
git pull origin dev
git checkout -b feature/add-payment-system
```

To push:
```[bash]
git add .
git commit -m "Build payment form UI"
git push origin feature/add-payment-system
```
