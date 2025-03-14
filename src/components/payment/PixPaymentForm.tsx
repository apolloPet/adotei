
interface PixPaymentFormProps {
  pixKey: string;
}

const PixPaymentForm = ({ pixKey }: PixPaymentFormProps) => {
  if (!pixKey) return null;
  
  // Generate a PIX QR code
  const generatePixQrCode = () => {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAADkAQMAAAAjexcCAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAAlwSFlzAAAOxAAADsQBlSsOGwAAADZJREFUWIXtzrENACAQw8A8gMT+IzIBVGn4BReZbGXtJJWkywMAAAAAAAAAAAAAAADwgyR99QCVsQQHdjG0KAAAAABJRU5ErkJggg==";
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border">
      <p className="text-sm text-center mb-4">
        Escaneie o QR Code abaixo com o aplicativo do seu banco para pagar com PIX:
      </p>
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
        <img 
          src={generatePixQrCode()} 
          alt="QR Code PIX" 
          className="w-48 h-48"
        />
      </div>
      <div className="text-xs text-muted-foreground text-center max-w-xs">
        <p>Após o pagamento, clique no botão abaixo para confirmar a adoção.</p>
        <p className="mt-2">Chave PIX: {pixKey}</p>
      </div>
    </div>
  );
};

export default PixPaymentForm;
