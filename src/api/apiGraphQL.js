import { useMutation, useLazyQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

const GET_AUTH_TOKEN = gql`
  mutation Auth($data: LoginInput!) {
    auth(data: $data) {
      accessToken
    }
  }
`;

const GET_USER_LDAP = gql`
    query GetUsersLdap($cnOrSAMA: String!) {
        searchUser(data: {cnOrSamaccountname: $cnOrSAMA}) {
        cn,
        sAMAccountName,
        distinguishedName,
        company,
        department,
        description,
        memberOf,
        title,
        userAccountControl
    }
}
`;

const ADMIN_LOGIN = import.meta.env.VITE_APP_ADMIN_LOGIN;
const ADMIN_PASSWORD = import.meta.env.VITE_APP_ADMIN_PASSWORD;

export const useAuthMutation = () => {
  const [authMutation, { loading: loadingAuth, error: errorAuth }] = useMutation(GET_AUTH_TOKEN);
  const [getUserFromLDAP, {loading: loadingUser, error: errorUser}] = useLazyQuery(GET_USER_LDAP, {
    fetchPolicy: 'network-only',
  });

  // проверка на валидность токена
  const isTokenValid = (token) => {
    if (!token) return false;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      
      if (payload.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp > currentTime;
      }
      
      return true;
    } catch {
      return false;
    }
  };

  // аутентификация пользователя и получение токена
  const performAuth = async () => {
    try {
        const token = localStorage.getItem('authRegeditADToken');

        if (token && isTokenValid(token)) {
            return { token };
        }

        const {data} = await authMutation({
            variables: {
                data: {
                    username: ADMIN_LOGIN,
                    password: ADMIN_PASSWORD,
                },
            },
        });

        const { accessToken } = data?.auth || {};

        if (!accessToken) {
            throw new Error('Ошибка аутентификации: нет токена.');
        }

        if (!isTokenValid(accessToken)) {
            throw new Error('Ошибка аутентификации: не валидный токен.');
        }

        localStorage.setItem('authRegeditADToken', accessToken);
        return { token: accessToken };
    } catch (err) {
      console.error('Authentication error in useAuthMutation:', err);
      throw new Error(`Ошибка при попытке аутентификации: ${err.message}`);
    }
  };

  const getUserInfoFromLDAP = async (cnOrSAMA) => {
    try {
      const {data} = await getUserFromLDAP({
        variables: {
          cnOrSAMA,
        },
      });
      return data;
    } catch (err) {
      console.error('Ошибка при попытке получение информации о пользователе:', err);
      throw new Error(`Ошибка при попытке получение информации о пользователе: ${err.message}`);
    }
  };

  return { performAuth, loadingAuth, errorAuth, getUserInfoFromLDAP, loadingUser, errorUser };
};