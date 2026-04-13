import React, { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { GlowButton } from '@/components/common/GlowButton';
import { 
  Shield, 
  Lock, 
  Key, 
  Smartphone, 
  CheckCircle,
  AlertTriangle,
  Copy,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';

interface SecurityViewProps {
  userFingerprint?: string;
}

export const SecurityView: React.FC<SecurityViewProps> = ({ 
  userFingerprint = 'A1B2 C3D4 E5F6 G7H8 I9J0 K1L2 M3N4 O5P6' 
}) => {
  const [showFingerprint, setShowFingerprint] = useState(false);
  const [copied, setCopied] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'idle' | 'scanning' | 'verified'>('idle');

  const copyFingerprint = () => {
    navigator.clipboard.writeText(userFingerprint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startVerification = () => {
    setVerificationStep('scanning');
    setTimeout(() => setVerificationStep('verified'), 3000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-secure-purple/20">
        <h2 className="text-xl font-bold text-white">Seguridad</h2>
        <p className="text-sm text-gray-400">Cifrado de extremo a extremo</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-custom">
        {/* Encryption status */}
        <GlassCard variant="purple" className="p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center relative">
            <Shield className="w-10 h-10 text-green-400" />
            <div className="absolute inset-0 rounded-full border-2 border-green-400/30 animate-ping" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Cifrado activado
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Tus mensajes están protegidos con cifrado de extremo a extremo. 
            Nadie fuera de este chat puede leerlos.
          </p>
          <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Verificado</span>
          </div>
        </GlassCard>

        {/* Key fingerprint */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secure-lilac/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-secure-lilac" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Huella de clave</h3>
              <p className="text-sm text-gray-400">Tu identidad única</p>
            </div>
          </div>
          
          <div className="bg-secure-black/50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <code className="text-secure-lilac font-mono text-sm">
                {showFingerprint ? userFingerprint : '•••• •••• •••• •••• •••• •••• •••• ••••'}
              </code>
              <button 
                onClick={() => setShowFingerprint(!showFingerprint)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {showFingerprint ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <GlowButton 
            variant="secondary" 
            size="sm" 
            className="w-full"
            onClick={copyFingerprint}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar huella
              </>
            )}
          </GlowButton>
        </GlassCard>

        {/* Security verification */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secure-lilac/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-secure-lilac" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Verificación de seguridad</h3>
              <p className="text-sm text-gray-400">Confirma la identidad de tus contactos</p>
            </div>
          </div>
          
          {verificationStep === 'idle' && (
            <GlowButton 
              variant="primary" 
              size="sm" 
              className="w-full"
              onClick={startVerification}
            >
              <Key className="w-4 h-4" />
              Verificar contacto
            </GlowButton>
          )}
          
          {verificationStep === 'scanning' && (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full border-4 border-secure-lilac/30 border-t-secure-lilac animate-spin" />
              <p className="text-sm text-gray-400">Verificando claves...</p>
            </div>
          )}
          
          {verificationStep === 'verified' && (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-sm text-green-400">¡Verificación exitosa!</p>
              <p className="text-xs text-gray-500 mt-1">
                Las claves coinciden correctamente
              </p>
            </div>
          )}
        </GlassCard>

        {/* Linked devices */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secure-lilac/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-secure-lilac" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Dispositivos vinculados</h3>
              <p className="text-sm text-gray-400">3 dispositivos activos</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {[
              { name: 'iPhone 15 Pro', status: 'Activo ahora', current: true },
              { name: 'MacBook Pro', status: 'Activo hace 2 horas', current: false },
              { name: 'iPad Air', status: 'Activo ayer', current: false },
            ].map((device, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-white flex items-center gap-2">
                      {device.name}
                      {device.current && (
                        <span className="px-2 py-0.5 bg-secure-lilac/20 text-secure-lilac text-xs rounded-full">
                          Este dispositivo
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{device.status}</p>
                  </div>
                </div>
                {!device.current && (
                  <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Security tips */}
        <GlassCard className="p-4">
          <h3 className="font-semibold text-white mb-3">Consejos de seguridad</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-secure-lilac mt-0.5 flex-shrink-0" />
              <span>Verifica regularmente las huellas de clave de tus contactos</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-secure-lilac mt-0.5 flex-shrink-0" />
              <span>No compartas tu código de verificación con nadie</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-secure-lilac mt-0.5 flex-shrink-0" />
              <span>Revisa los dispositivos vinculados periódicamente</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-secure-lilac mt-0.5 flex-shrink-0" />
              <span>Activa la verificación en dos pasos</span>
            </li>
          </ul>
        </GlassCard>
      </div>
    </div>
  );
};

export default SecurityView;
