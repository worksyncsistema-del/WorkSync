import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.0.100:5000';

export default function LoginScreen() {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const mascaraCPF = (value: string) => {
    const n = value.replace(/\D/g, '');
    let f = n;
    if (n.length > 3) f = n.slice(0, 3) + '.' + n.slice(3);
    if (n.length > 6) f = f.slice(0, 7) + '.' + n.slice(6);
    if (n.length > 9) f = f.slice(0, 11) + '-' + n.slice(9, 11);
    setCpf(f.slice(0, 14));
  };

  const verificarCPF = () => {
    const numeros = cpf.replace(/\D/g, '');
    if (numeros.length !== 11) {
      Alert.alert('CPF inválido', 'Digite um CPF válido com 11 dígitos.');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!cpf || !senha) {
      Alert.alert('Campos vazios', 'Foram encontrados campos vazios. Tente novamente.');
      return;
    }
    if (!verificarCPF()) return;

    setCarregando(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf: cpf.replace(/\D/g, ''),
          senha,
        }),
      });

      const data = await response.json();
      console.log('Status HTTP:', response.status);
      console.log('Resposta do servidor:', JSON.stringify(data));

      if (data.ok) {
        await AsyncStorage.setItem('usuario', JSON.stringify({
          nome: data.nome,
          tipo: data.tipo,
        }));
        router.replace('/(tabs)' as any);
      } else {
        Alert.alert('Erro no login', data.erro || 'Tente novamente.');
      }
    } catch (error) {
      Alert.alert('Erro de conexão', 'Não foi possível conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F2" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >

        {/* Card */}
        <View style={styles.card}>

          {/* Header azul */}
          <View style={styles.header}>
            <Text style={styles.headerText}>
              <Text style={styles.headerWork}>WORK</Text>
              <Text style={styles.headerSync}>SYNC</Text>
            </Text>
          </View>

          {/* Body */}
          <View style={styles.body}>

            {/* CPF */}
            <TextInput
              style={styles.input}
              placeholder="CPF"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={14}
              value={cpf}
              onChangeText={mascaraCPF}
            />

            {/* Senha */}
            <View style={styles.passwordBox}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Senha"
                placeholderTextColor="#999"
                secureTextEntry={!senhaVisivel}
                maxLength={12}
                value={senha}
                onChangeText={setSenha}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setSenhaVisivel(!senhaVisivel)}
                activeOpacity={0.7}
              >
                <Text style={styles.eyeIcon}>{senhaVisivel ? '👁' : '🙈'}</Text>
              </TouchableOpacity>
            </View>

            {/* Botão */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={carregando}
              activeOpacity={0.85}
            >
              {carregando
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>Entrar</Text>
              }
            </TouchableOpacity>

            {/* Esqueci senha */}
            <TouchableOpacity onPress={() => router.push('/recuperacaoSenha' as any)}>
              <Text style={styles.forgotPassword}>Esqueci minha senha?</Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Copyright WorkSync © 2026</Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Fundo cinza igual ao body da web
  page: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },

  // Card branco com sombra
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  // Header azul
  header: {
    backgroundColor: '#0F5C8C',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  headerWork: {
    color: '#000',
    fontSize: 30,
    fontWeight: 'bold',
  },
  headerSync: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },

  // Body do card
  body: {
    padding: 40,
    alignItems: 'center',
  },

  // Inputs com fundo cinza
  input: {
    width: '100%',
    backgroundColor: '#F2F2F2',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    color: '#333',
    marginBottom: 15,
  },

  // Campo senha
  passwordBox: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    paddingRight: 40,
    marginTop: 0,
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    top: '20%',
  },
  eyeIcon: {
    fontSize: 16,
    color: '#777',
  },

  // Botão azul
  button: {
    width: '100%',
    backgroundColor: '#0F5C8C',
    borderRadius: 4,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 0,
    minHeight: 44,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
  },

  // Link esqueci senha
  forgotPassword: {
    marginTop: 10,
    fontSize: 13,
    color: '#555',
    textDecorationLine: 'underline',
  },

  // Footer
  footer: {
    marginTop: 20,
    fontSize: 12,
    color: '#999',
  },
});