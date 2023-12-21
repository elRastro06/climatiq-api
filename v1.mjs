import express from "express";
import axios from "axios";
import 'dotenv/config';

const app = express.Router();

const authorization = "Bearer " + process.env.CLIMATIQ_API_KEY;
const DISTANCE_API_URI = process.env.DISTANCE_API_URI;

app.get("/co2", async (req, res) => {
    const from = req.query.from;
    const to = req.query.to;

    if (!from) {
        res.send({ error: "Bad request. Initial point not specified" }).status(400);
        return;
    } else if (!to) {
        res.send({ error: "Bad request. Destination point not specified" }).status(400);
        return;
    }

    let response = await axios.get(DISTANCE_API_URI + "/v1/geocoding?location=" + from);
    const coordFrom = response.data.lat + "," + response.data.lon;

    response = await axios.get(DISTANCE_API_URI + "/v1/geocoding?location=" + to);
    const coordTo = response.data.lat + "," + response.data.lon;

    response = await axios.get(DISTANCE_API_URI + "/v1/distance?from=" + coordFrom + "&to=" + coordTo);
    const distance = response.data.distance;

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

    response = await axios.post("https://beta4.api.climatiq.io/estimate", query,
        {
            headers:  {
                "Authorization": authorization
            }
        });

    const co2 = { "co2e": response.data.co2e, "co2e_unit": response.data.co2e_unit,
                  "shipping_tax": (response.data.co2e / 100), "shipping_tax_unit": "€" };
    res.send(co2).status(200);
});

export default app;