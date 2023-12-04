// Imports the index.js file to be tested.
const server = require("../index"); //TO-DO Make sure the path to your index.js is correctly added
// Importing libraries

// Chai HTTP provides an interface for live integration testing of the API's.
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp);
const { assert, expect } = chai;

describe("Server!", () => {
    // Sample test case given to test / endpoint.
    it("Returns the default welcome message", (done) => {
        chai.request(server)
            .get("/welcome")
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.status).to.equals("success");
                assert.strictEqual(res.body.message, "Welcome!");
                done();
            });
    });

    // ===========================================================================
    // TO-DO: Part A Login unit test case

    //We are checking POST /login API by passing the user info in the correct order. This test case should pass and return a status 200 along with a "Success" message.
    //Positive cases
    it("positive : /login", (done) => {
        chai.request(server)
            .post("/login")
            .send({ username: "mae", password: "test" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    //We are checking POST /login API by passing the user info in in incorrect manner (username doesnt exist). This test case should pass and return a status 200 along with a "Invalid input" message.
    it("Negative : /login. Checking if user exists", (done) => {
        chai.request(server)
            .post("/login")
            .send({ username: "noah", password: "2020-02-20" })
            .end((err, res) => {
                expect(res).to.have.status(202);
                done();
            });
    });

    //We are checking GET /discoverData API by passing the lattitude and longitude info in the correct data type (decimal). This test case should pass and return a status 200 along with a "Success" message.
    //Positive cases
    // it("positive : /discoverData", (done) => {
    //     chai.request(server)
    //         .get("/discoverData")
    //         .query({ latitude: 10, longitude: 10, radius: 10})
    //         .end((err, res) => {
    //             expect(res).to.have.status(200);
    //             // expect(res.body.message).to.equals("Success");
    //             done();
    //         });
    // });

    // //We are checking GET /discoverData API by passing the latitude and longitude info in in incorrect manner (info cannot be a string). This test case should pass and return a status 200 along with a "Invalid input" message.
    // it("Negative : /discoverData. Checking invalid lat and long", (done) => {
    //     chai.request(server)
    //         .get("/discoverData")
    //         .query({ latitude: "ten", longitude: "ten", radius: 10 })
    //         .end((err, res) => {
    //             // console.log(res.body)
    //             expect(res).to.have.status(404);
    //             // expect(res.body.message).to.equals("Invalid input");
    //             done();
    //         });
    // });
});
