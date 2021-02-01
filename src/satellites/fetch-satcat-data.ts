import { DynamoDB } from 'aws-sdk';
import { Handler, ScheduledEvent } from 'aws-lambda';
import nodeFetch from 'node-fetch';
import fetchCookie from 'fetch-cookie';
import { SatelliteData } from './satellite-data.interface';

const fetch = fetchCookie(nodeFetch);

const dynamoDb = new DynamoDB.DocumentClient();

const loginToSpaceTrack = async (): Promise<void> => {
  const REQUEST_URL = 'https://www.space-track.org/ajaxauth/login';
  const identity = process.env.SPACE_TRACK_USERNAME;
  const password = process.env.SPACE_TRACK_PASSWORD;

  await fetch(REQUEST_URL, {
    method: 'post',
    body: new URLSearchParams({ identity, password }),
  });

  console.log(`Successfully logged in to Space Track.`);
};

const getSatellitesData = async (): Promise<SatelliteData[]> => {
  await loginToSpaceTrack();

  const REQUEST_URL =
    'https://www.space-track.org/basicspacedata/query/class/gp/' +
    'OBJECT_NAME/~~starlink/OBJECT_TYPE/payload/' +
    'orderby/NORAD_CAT_ID,EPOCH/format/json';

  const satellites = await (await fetch(REQUEST_URL)).json();

  return satellites.map((sat) => ({
    noradCatID: sat.NORAD_CAT_ID,
    name: sat.OBJECT_NAME,
    decayDate: sat.DECAY_DATE,
    launchDate: sat.LAUNCH_DATE,
    epoch: sat.EPOCH,
    tle1: sat.TLE_LINE1,
    tle2: sat.TLE_LINE2,
    updatedAt: new Date().toISOString(),
  }));
};

const saveToDatabase = async (data: SatelliteData): Promise<void> => {
  await dynamoDb
    .put({
      TableName: process.env.DYNAMODB_TABLE,
      Item: data,
    })
    .promise();

  console.log(`Satellite ${data.noradCatID} saved.`);
};

const FetchSATCATData: Handler<ScheduledEvent> = async () => {
  try {
    const satelliteData = await getSatellitesData();

    console.log(`Downloaded ${satelliteData.length} satellites.`);

    for (const sat of satelliteData) {
      await saveToDatabase(sat);
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports.FetchSATCATData = FetchSATCATData;
