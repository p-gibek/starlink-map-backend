import { DynamoDB } from 'aws-sdk';
import { APIGatewayEvent, APIGatewayProxyResultV2, Handler } from 'aws-lambda';

const dynamoDb = new DynamoDB.DocumentClient();

const ListSatellitesHandler: Handler<APIGatewayEvent, APIGatewayProxyResultV2> = async (event, context) => {
  const satellitesData = await dynamoDb
    .scan({
      TableName: process.env.DYNAMODB_TABLE,
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify(satellitesData?.Items),
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  };
};

module.exports.ListSatellitesHandler = ListSatellitesHandler;
