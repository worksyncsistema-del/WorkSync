import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, KeyboardAvoidingView,
  Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Troque pelo IP da sua máquina na rede local
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
      Alert.alert('Campos vazios', 'Preencha o CPF e a senha.');
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
        // Salva os dados do usuário localmente
        await AsyncStorage.setItem('usuario', JSON.stringify({
          nome: data.nome,
          tipo: data.tipo,
        }));
        router.replace('/(tabs)/index' as any);
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <Text style={styles.logoWork}>WORK<Text style={styles.logoSync}>SYNC</Text></Text>
        </View>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="CPF"
            placeholderTextColor="#888"
            keyboardType="numeric"
            maxLength={14}
            value={cpf}
            onChangeText={mascaraCPF}
          />

          <View style={styles.passwordBox}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Senha"
              placeholderTextColor="#888"
              secureTextEntry={!senhaVisivel}
              maxLength={12}
              value={senha}
              onChangeText={setSenha}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setSenhaVisivel(!senhaVisivel)}>
              <Text style={styles.eyeIcon}>{senhaVisivel ? '👁' : '🙈'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={carregando}>
            {carregando
              ? <ActivityIndicator color="#0a0a0a" />
              : <Text style={styles.buttonText}>Entrar</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/recuperacaoSenha' as any)}>
            <Text style={styles.forgotPassword}>Esqueci minha senha?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Copyright WorkSync © 2026</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scrollContent: { flexGrow: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 },
  header: { alignItems: 'center', marginBottom: 48 },
  logoWork: { fontSize: 38, letterSpacing: 6, fontWeight: '300', color: '#ffffff' },
  logoSync: { fontSize: 38, letterSpacing: 6, fontWeight: '900', color: '#ffffff' },
  card: { width: '100%', maxWidth: 380, backgroundColor: '#161616', borderRadius: 16, paddingHorizontal: 28, paddingVertical: 36, borderWidth: 1, borderColor: '#2a2a2a' },
  input: { width: '100%', height: 52, backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#333', borderRadius: 8, paddingHorizontal: 16, color: '#f0f0f0', fontSize: 15, marginBottom: 16 },
  passwordBox: { position: 'relative', width: '100%' },
  passwordInput: { paddingRight: 50 },
  eyeButton: { position: 'absolute', right: 14, top: 14, padding: 4 },
  eyeIcon: { fontSize: 18 },
  button: { width: '100%', height: 52, backgroundColor: '#ffffff', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 20, marginTop: 4 },
  buttonText: { color: '#0a0a0a', fontWeight: '700', fontSize: 15, letterSpacing: 1.5 },
  forgotPassword: { textAlign: 'center', color: '#888', fontSize: 13, textDecorationLine: 'underline' },
  footer: { marginTop: 48, alignItems: 'center' },
  footerText: { color: '#444', fontSize: 12 },
});