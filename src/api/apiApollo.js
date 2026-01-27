import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { createHttpLink } from '@apollo/client';

const VITE_APP_URI_GRAPHQL = import.meta.env.VITE_APP_URI_GRAPHQL;

// Создаем HTTP-линк для подключения к GraphQL API
const httpLink = createHttpLink({
  uri: VITE_APP_URI_GRAPHQL,
});

// Создаем authLink для добавления токена авторизации
const authLink = setContext((_, { headers }) => {
  // Получаем токен авторизации из localStorage или другого хранилища
  const token = localStorage.getItem('authRegeditADToken'); // Предполагается, что токен хранится под ключом 'authToken'
  // Возвращаем новые заголовки, добавляя токен, если он существует
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink), // Объединяем authLink с httpLink
  cache: new InMemoryCache(),
});

export default client;