'use client';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface AuthFormProps {
  onSuccess: () => void;
}

export const AuthForm = ({ onSuccess }: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisitorLoading, setIsVisitorLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const success = await login(username, password);
        if (success) {
          onSuccess();
        } else {
          setError('Invalid credentials');
        }
      } else {
        // Registration followed by automatic login
        const registerSuccess = await register(username, password);
        if (registerSuccess) {
          // Attempt login after successful registration
          const loginSuccess = await login(username, password);
          if (loginSuccess) {
            onSuccess();
          } else {
            setError('There was an error during login. Please try again later.');
          }
        } else {
          setError('Registration failed');
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVisitorLogin = async () => {
    setIsVisitorLoading(true);
    setError(null);

    try {
      const success = await login('Visitor', 'VisitorPassword');
      if (success) {
        onSuccess();
      } else {
        setError('Visitor login failed');
      }
    } catch (error) {
      setError('Failed to login as visitor');
    } finally {
      setIsVisitorLoading(false);
    }
  };

  return (
    <div className="flex-column container mx-auto flex max-w-2xl items-start justify-center px-1 pt-12 md:px-5">
      <Card className="w-full max-w-md rounded-lg p-5 shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">{isLogin ? 'Login' : 'Register'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={2}
              maxLength={30}
            />
            {/* Password field with eye icon */}
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {error && <div className="text-sm text-destructive">{error}</div>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
            </Button>
          </form>

          {/* Visitor Login Button - Only show on login form */}
          {isLogin && (
            <div className="mt-3">
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleVisitorLogin}
                disabled={isLoading || isVisitorLoading}>
                {isVisitorLoading ? 'Logging in...' : 'Login as Visitor'}
              </Button>
            </div>
          )}

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-sm text-primary underline">
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
