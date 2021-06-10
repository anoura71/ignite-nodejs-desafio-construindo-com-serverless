import 'dotenv/config';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuidV4 } from 'uuid';

import { document } from '../utils/dynamodbClient';

interface ICreateUser {
  name: string;
  username: string;
}

/** Cadastrar um novo usuário. */
export const handle: APIGatewayProxyHandler = async (event) => {
  const { name, username } = JSON.parse(event.body) as ICreateUser;

  // Verifica se o username já está cadastrado
  const response = await document
    .scan({
      TableName: 'users',
      ProjectionExpression: 'username, id',
    })
    .promise();
  const [userAlreadyExists] = response.Items.filter(
    (user) => user.username === username
  );
  if (userAlreadyExists) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'User already exists',
        username,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  // Monta o objeto Usuário
  const user = {
    id: uuidV4(),
    name,
    username,
  };

  // Insere os dados no DynamoDB
  await document
    .put({
      TableName: 'users',
      Item: user,
    })
    .promise();

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: 'User created',
      user,
    }),
    headers: {
      'Content-type': 'application/json',
    },
  };
};
