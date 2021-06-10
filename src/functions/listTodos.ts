import 'dotenv/config';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { checksExistingUser } from 'src/utils/checkExistingUser';

import { document } from '../utils/dynamodbClient';

/** Listar todas as tarefas de um usuário. */
export const handle: APIGatewayProxyHandler = async (event) => {
  const { user_id } = event.pathParameters;

  const user = await checksExistingUser(user_id);
  if (!user) {
    // Usuário não encontrado
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'User does not exist',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  // Busca as tarefas do usuário
  const response = await document
    .scan({
      TableName: 'todos',
      FilterExpression: 'user_id = :user_id',
      ExpressionAttributeValues: {
        ':user_id': user_id,
      },
    })
    .promise();

  if (response.Items.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'No todos for this user',
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
