import 'dotenv/config';
import { APIGatewayProxyHandler } from 'aws-lambda';

import { document } from '../utils/dynamodbClient';

/** Listar todos os usuários cadastrados. */
export const handle: APIGatewayProxyHandler = async () => {
  // Busca os usuários cadastrados
  const response = await document
    .scan({
      TableName: 'users',
    })
    .promise();

  if (response.Items.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'No users in the database',
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(response.Items),
    headers: {
      'Content-type': 'application/json',
    },
  };
};
