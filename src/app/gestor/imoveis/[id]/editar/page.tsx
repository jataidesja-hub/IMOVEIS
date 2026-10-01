import ImovelFormPage from '@/components/ImovelFormPage';

export default function GestorEditarImovel() {
  return (
    <div className="p-2 sm:p-6">
      <ImovelFormPage modo="editar" retornoUrl="/gestor/imoveis" />
    </div>
  );
}
