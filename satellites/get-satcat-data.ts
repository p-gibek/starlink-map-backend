import { DynamoDB } from 'aws-sdk'
import { APIGatewayEvent, APIGatewayProxyResultV2, Handler } from 'aws-lambda';

const dynamoDb = new DynamoDB.DocumentClient()

const GetSATCATDataHandler: Handler<APIGatewayEvent, APIGatewayProxyResultV2> = async (event, context) => {

  return {statusCode: 200, body: JSON.stringify({x: 'd'})}
}

module.exports.GetSATCATDataHandler = GetSATCATDataHandler
