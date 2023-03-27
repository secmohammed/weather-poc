To run the application, you have to run
```shell
docker compose up
```
- The application is going to create the database if it doesn't exist and connect to it automatically. Therefore, there is no any prerequisites to bootstrap the app.  
- You can go to localhost:8000/api to browse the SWAGGER API documentation and execute the requests

### FOR RUNNING E2E TESTS 
After running docker compose up

** Note: The application is going to create the database as well for the testing environment if doesn't exist and will drop it when tearing down.
> npm run test:e2e 
