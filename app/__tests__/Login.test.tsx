
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Login from '@/app/Login'; // Asegúrate que la ruta sea correcta


// Mock de expo-router
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
    back: jest.fn(),
  }),
}));

// Mock del ContextProvider
const mockSetToken = jest.fn();
jest.mock('@/utils/ContextProvider', () => ({
  useContextProvider: () => ({
    apiURL: 'http://fake-api.com',
    setToken: mockSetToken,
    adminUser: false,
  }),
}));

// Mock de componentes visuales que no afectan la lógica
jest.mock('@/components/BottomDesign', () => 'BottomDesign');
jest.mock('@/components/Cube', () => 'Cube');

// Mock de react-native-toast-message
const mockToastShow = jest.fn();
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

// Mock de Dimensions para evitar errores en el renderizado del SVG
jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');
    RN.Dimensions.get = () => ({ width: 400, height: 800 });
    return RN;
});


// --- Pruebas ---

describe('Login Screen', () => {
  // Limpiar mocks después de cada prueba para evitar interferencias
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Mock global de la función fetch
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({}),
    })
  ) as jest.Mock;


  it('debería renderizar el formulario de login por defecto', () => {
    const { getByPlaceholderText, getByText } = render(<Login />);

    // Verifica que los campos y botones del formulario de login están presentes
    expect(getByPlaceholderText('Nombre de usuario / Correo electrónico')).toBeTruthy();
    expect(getByPlaceholderText('Contraseña')).toBeTruthy();
    expect(getByText('Entrar')).toBeTruthy();
    expect(getByText('¿Olvidaste tu contraseña?')).toBeTruthy();
  });

  it('debería permitir al usuario escribir en los campos de texto', () => {
    const { getByPlaceholderText } = render(<Login />);
    
    const identifierInput = getByPlaceholderText('Nombre de usuario / Correo electrónico');
    const passwordInput = getByPlaceholderText('Contraseña');

    fireEvent.changeText(identifierInput, 'testuser');
    fireEvent.changeText(passwordInput, 'password123');

    expect(identifierInput.props.value).toBe('testuser');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('debería navegar a Lobby en un inicio de sesión exitoso', async () => {
    // Simulamos una respuesta exitosa de la API
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ token: 'fake-jwt-token' }),
    });

    const { getByText, getByPlaceholderText } = render(<Login />);

    const identifierInput = getByPlaceholderText('Nombre de usuario / Correo electrónico');
    const passwordInput = getByPlaceholderText('Contraseña');
    const loginButton = getByText('Entrar');

    fireEvent.changeText(identifierInput, 'validuser');
    fireEvent.changeText(passwordInput, 'validpass');
    fireEvent.press(loginButton);

    // Esperamos a que las llamadas asíncronas (fetch, setToken, router.replace) se completen
    await waitFor(() => {
      // Verificamos que se llamó a la API con los datos correctos
      expect(global.fetch).toHaveBeenCalledWith('http://fake-api.com/login', expect.any(Object));
      // Verificamos que se guardó el token
      expect(mockSetToken).toHaveBeenCalledWith('fake-jwt-token');
      // Verificamos que se redirigió al usuario
      expect(mockReplace).toHaveBeenCalledWith('/Lobby');
    });
  });

  it('debería mostrar un error si el login falla', async () => {
    // Simulamos una respuesta de error de la API
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ message: 'Credenciales inválidas' }),
    });

    const { getByText, getByPlaceholderText } = render(<Login />);
    
    fireEvent.changeText(getByPlaceholderText('Nombre de usuario / Correo electrónico'), 'invaliduser');
    fireEvent.changeText(getByPlaceholderText('Contraseña'), 'wrongpass');
    fireEvent.press(getByText('Entrar'));

    await waitFor(() => {
      expect(require('react-native-toast-message').show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Error',
        text2: 'Credenciales inválidas',
        position: 'top',
        visibilityTime: 3000,
      });
    });

    // Verificamos que no se llamó a setToken ni a router.replace
    expect(mockSetToken).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('debería cambiar al formulario de recuperar contraseña al hacer clic en el enlace', () => {
    const { getByText, queryByText } = render(<Login />);

    const forgotPasswordLink = getByText('¿Olvidaste tu contraseña?');
    fireEvent.press(forgotPasswordLink);

    // Verificamos que el nuevo formulario es visible y el antiguo no
    expect(getByText('Recuperar Contraseña')).toBeTruthy();
    expect(getByText('Enviar Código')).toBeTruthy();
    expect(queryByText('Entrar')).toBeNull();
  });

  it('debería navegar a VerifyCode al enviar el formulario de recuperar contraseña', async () => {
    // Simulamos una respuesta exitosa para el envío del código
    (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ email: 'test@example.com' }),
    });

    const { getByText, getByPlaceholderText } = render(<Login />);

    // Cambiamos al formulario de recuperar contraseña
    fireEvent.press(getByText('¿Olvidaste tu contraseña?'));

    const identifierInput = getByPlaceholderText('Nombre de usuario / Correo electrónico');
    const sendCodeButton = getByText('Enviar Código');

    fireEvent.changeText(identifierInput, 'user-to-recover');
    fireEvent.press(sendCodeButton);

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('http://fake-api.com/send-reset-code', expect.any(Object));
        expect(mockReplace).toHaveBeenCalledWith({
            pathname: '/VerifyCode',
            params: { identifier: 'user-to-recover' },
        });
    });
  });
});