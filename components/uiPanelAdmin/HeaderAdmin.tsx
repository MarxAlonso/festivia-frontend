export const HeaderAdmin: React.FC = () => {

  return (
    <div className="bg-white border-b border-celebrity-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-serif text-celebrity-gray-900">
                Panel de Administración
              </h1>
              <p className="text-celebrity-gray-600 mt-1">
                Gestiona usuarios, permisos y configuración del sistema
              </p>
            </div>
            {/*<Link href="/panel">
              <Button size="lg" className="celebrity-gradient text-white hover:opacity-90">
                Volver al Panel de Usuario
              </Button>
            </Link>*/}
          </div>
        </div>
  );
};