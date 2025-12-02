import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Lobby from '@/app/Lobby';


// 1. Mock de expo-router: Necesario para probar la navegación sin errores.
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
  }),
}));

// 2. Mock del ContextProvider: Proporcionamos valores básicos para que el componente no falle.
jest.mock('@/utils/ContextProvider', () => ({
  useContextProvider: () => ({
    token: '', // Simulamos ser un invitado.
    apiURL: 'http://fake-api.com',
    setIdUser: jest.fn(),
    setUserName: jest.fn(),
    setAdminUser: jest.fn(),
    setDefBoard: jest.fn(),
    setDefDice: jest.fn(),
  }),
}));

// 3. Mock de componentes visuales: Para evitar errores de renderizado de componentes complejos.
jest.mock('@/components/BottomDesign', () => 'BottomDesign');

// 4. Mock de Toast para evitar errores.
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

describe('Acciones en la pantalla de Lobby', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Prueba de acción: Unirse a una partida
  it('debería navegar a GamersGroup con el código correcto al presionar "Unirse"', () => {
    const { getByText, getByDisplayValue } = render(<Lobby />);
    
    const codeInput = getByDisplayValue(''); // Buscamos el input por su valor inicial vacío.
    const joinButton = getByText('Unirse');

    // Acción 1: El usuario escribe un código.
    fireEvent.changeText(codeInput, 'ABCDE');
    
    // Acción 2: El usuario presiona el botón.
    fireEvent.press(joinButton);

    // 3. Verificamos que se llamó a la función de navegación con los datos correctos.
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/GamersGroup',
      params: { mode: 1, roomCode: 'ABCDE' },
    });
  });
});