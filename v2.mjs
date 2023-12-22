import express from "express";
import axios from "axios";
import "dotenv/config";

const app = express.Router();

const authorization = "Bearer " + process.env.CLIMATIQ_API_KEY;
const DISTANCE_API_URI = process.env.DISTANCE_API_URI;

app.get("/co2/:long1/:lat1/:long2/:lat2", async (req, res) => {
  
  /*
  const distance = Math.acos(
                    Math.sin(req.params.lat1)*Math.sin(req.params.lat2) + 
                    Math.cos(req.params.lat1)*Math.cos(req.params.lat2) * 
                    Math.cos(req.params.long2 - req.params.long1)
                   )*6371;
  //https://community.fabric.microsoft.com/t5/Desktop/How-to-calculate-lat-long-distance/td-p/1488227
  */
  
  const coordFrom = req.params.lat1 + "," + req.params.long1;
  const coordTo = req.params.lat2 + "," + req.params.long2;

  let response = await axios.get(DISTANCE_API_URI + "/v1/distance?from=" + coordFrom + "&to=" + coordTo);
  const distance = response.data.distance;

  const query = {
    emission_factor: {
      activity_id:
        "passenger_vehicle-vehicle_type_car-fuel_source_petrol-engine_size_na-vehicle_age_na-vehicle_weight_na",
      source: "ADEME",
      region: "FR",
      year: 2021,
      source_lca_activity: "fuel_upstream-fuel_combustion",
      data_version: "5.5",
    },
    parameters: {
      distance: distance,
      distance_unit: "km",
    },
  };

  response = await axios.post("https://beta4.api.climatiq.io/estimate", query, {
    headers: {
      Authorization: authorization,
    },
  });

  const co2 = {
    distance: parseFloat(distance.toFixed(2)),
    co2e: response.data.co2e,
    co2e_unit: response.data.co2e_unit,
    shipping_tax: parseFloat((response.data.co2e / 100).toFixed(2)),
    shipping_tax_unit: "€",
  };

  console.log(co2);
  res.send(co2).status(200);
});

export default app;
