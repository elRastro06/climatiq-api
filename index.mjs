import express from "express";
import axios from "axios";
import 'dotenv/config';

const app = express();
const port = 5003;
const authorization = "Bearer " + process.env.CLIMATIQ_API_KEY;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});

app.get("/co2", async (req, res) => {
    const distance = parseInt(req.query.distance);

    if (!distance) {
        res.send({ error: "Bad request. No distance specified" }).status(400);
        return;
    }

    const query = {
        "emission_factor": {
            "activity_id": "passenger_vehicle-vehicle_type_car-fuel_source_petrol-engine_size_na-vehicle_age_na-vehicle_weight_na",
            "source": "ADEME",
            "region": "FR",
            "year": 2021,
            "source_lca_activity": "fuel_upstream-fuel_combustion",
            "data_version": "5.5"
        },
        "parameters": {
            "distance": distance,
            "distance_unit": "km"
        }
    };

    const response = await axios.post("https://beta4.api.climatiq.io/estimate", query,
        {
            headers:  {
                "Authorization": authorization
            }
        });

    const co2 = { "co2e": response.data.co2e, "co2e_unit": response.data.co2e_unit };
    res.send(co2).status(200);
});