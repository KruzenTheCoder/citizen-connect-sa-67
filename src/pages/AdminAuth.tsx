import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const AdminAuth = () => {
  const [email, setEmail] = useState('admin@joburg.org.za');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First try to sign in normally
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // If sign in fails, call our edge function to set up the admin user
        if (signInError.message.includes('Invalid login credentials')) {
          console.log('Admin user not found, setting up admin account...');
          
          const { error: setupError } = await supabase.functions.invoke('setup-admin', {
            body: { email, password }
          });

          if (setupError) {
            throw setupError;
          }

          // Now try to sign in again
          const { error: retrySignInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (retrySignInError) {
            throw retrySignInError;
          }

          toast.success('Admin account created and logged in successfully!');
        } else {
          throw signInError;
        }
      } else {
        toast.success('Logged in successfully!');
      }

      navigate('/');
    } catch (err: unknown) {
      console.error('Authentication error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4 pt-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Municipality Admin</h1>
          <p className="text-muted-foreground">Test Admin Account Access</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Admin Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Alert>
                <AlertDescription>
                  <strong>Test Credentials:</strong><br />
                  Email: admin@joburg.org.za<br />
                  Password: admin123
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In as Admin'
                )}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t">
              <Button
                variant="ghost"
                onClick={() => navigate('/auth')}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Regular Auth
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            This is a test admin account for the Johannesburg Municipality
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;