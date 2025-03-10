import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Building2, MapPin, DollarSign, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getFeaturedProperties } from '../services/api';
import type { Property } from '../types/property';
// Importando os novos ícones
import { Bed, Bath, Square, Phone, Mail, School as Pool, Trees as Tree, Car, Shield, Wind, Refrigerator, X, ArrowLeft } from 'lucide-react';

function Home() {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [currentImageIndexes, setCurrentImageIndexes] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchType, setSearchType] = useState<'sale' | 'rent' | ''>('');
  
  useEffect(() => {
    const loadFeaturedProperties = async () => {
      try {
        const properties = await getFeaturedProperties();
        setFeaturedProperties(properties);
        // Inicializa o índice da imagem atual para cada propriedade
        setCurrentImageIndexes(new Array(properties.length).fill(0));
      } catch (error) {
        console.error('Erro ao carregar imóveis em destaque:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadFeaturedProperties();
  }, []);

  const nextImage = useCallback((propertyIndex: number) => {
    const property = featuredProperties[propertyIndex];
    if (!property?.images || property.images.length <= 1) return;
    setCurrentImageIndexes(prev => {
      const newIndexes = [...prev];
      const currentIndex = newIndexes[propertyIndex];
      const imagesLength = property.images.length;
      newIndexes[propertyIndex] = currentIndex === imagesLength - 1 ? 0 : currentIndex + 1;
      return newIndexes;
    });
  }, [featuredProperties]);

  const prevImage = useCallback((propertyIndex: number) => {
    const property = featuredProperties[propertyIndex];
    if (!property?.images || property.images.length <= 1) return;
    setCurrentImageIndexes(prev => {
      const newIndexes = [...prev];
      const currentIndex = newIndexes[propertyIndex];
      const imagesLength = property.images.length;
      newIndexes[propertyIndex] = currentIndex === 0 ? imagesLength - 1 : currentIndex - 1;
      return newIndexes;
    });
  }, [featuredProperties]);

  const handleImageDotClick = useCallback((propertyIndex: number, imageIndex: number) => {
    setCurrentImageIndexes(prev => {
      const newIndexes = [...prev];
      newIndexes[propertyIndex] = imageIndex;
      return newIndexes;
    });
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation) {
      params.append('location', searchLocation);
    }
    if (searchType) {
      params.append('type', searchType);
    }
    navigate({
      pathname: '/properties',
      search: params.toString(),
    });
  };

  return (
    <div className="space-y-12">
      {/* Hero Section with Search */}
      <section className="relative h-[500px] sm:h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Luxury Home"
            className="absolute inset-0 w-full h-full object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>
        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 sm:px-0">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
            Encontre as melhores casas em Escarpas do lago e Região!
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-8 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            Descubra a propriedade perfeita para você
          </p>
          {/* Search Box - Mobile Optimized */}
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-xl mx-auto">
            <div className="flex flex-col gap-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por localização..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Property Type Dropdown */}
                <select 
                  className="w-full sm:w-1/2 px-4 py-3 rounded-lg border text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as 'sale' | 'rent' | '')}
                >
                  <option value="">Tipo de Imóvel</option>
                  <option value="sale">Venda</option>
                  <option value="rent">Aluguel</option>
                </select>
                {/* Search Button */}
                <button 
                  onClick={handleSearch}
                  className="w-full sm:w-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Featured Properties Section */}
      <section className="py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Imóveis em Destaque</h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-[500px]">
              <div className="flex flex-col items-center">
                <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600">Carregando imóveis em destaque...</p>
              </div>
            </div>
          ) : featuredProperties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Nenhum imóvel em destaque no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredProperties.slice(0, 3).map((property, propertyIndex) => (
                <div key={propertyIndex} className="bg-white p-6 rounded-lg shadow-md relative">
                  {/* Carousel de Imagens */}
                  <div className="mb-6">
                    {property.images.length > 0 && (
                      <div className="relative">
                        <img
                          src={property.images[currentImageIndexes[propertyIndex] || 0]}
                          alt={`${property.title} - Imagem ${(currentImageIndexes[propertyIndex] || 0) + 1}`}
                          className="rounded-lg w-full h-[150px] object-cover"
                        />
                        <div className="absolute top-1/2 left-4 -translate-y-1/2 opacity-90">
                          <button
                            onClick={() => prevImage(propertyIndex)}
                            className="rounded-full bg-gray-800/50 p-2 hover:bg-gray-800/75 transition-opacity duration-300"
                          >
                            <ChevronLeft className="w-6 h-6 text-white" />
                          </button>
                        </div>
                        <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-90">
                          <button
                            onClick={() => nextImage(propertyIndex)}
                            className="rounded-full bg-gray-800/50 p-2 hover:bg-gray-800/75 transition-opacity duration-300"
                          >
                            <ChevronRight className="w-6 h-6 text-white" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{property.title}</h3>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>{property.location}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <Bed className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                      <span className="block text-sm text-gray-600">{property.bedrooms} Quartos</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <Bath className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                      <span className="block text-sm text-gray-600">{property.bathrooms} Banheiros</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <Square className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                      <span className="block text-sm text-gray-600">{property.area}m²</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mb-6">
                    {`R$ ${property.price.toLocaleString('pt-BR')}${property.type === 'rent' ? '/mês' : ''}`}
                  </div>
                  <Link to={`/properties/${property.id}`} className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    Ver Detalhes
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* Promotional Section */}
      <section className="py-12 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">Anuncie seu Imóvel</h2>
              <p className="text-xl">
                Alcance milhares de compradores e inquilinos interessados.
                Nossa plataforma oferece:
              </p>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <Building2 className="w-6 h-6 flex-shrink-0 text-yellow-400" />
                  <span>Exposição para um público qualificado</span>
                </li>
                <li className="flex items-center space-x-3">
                  <MapPin className="w-6 h-6 flex-shrink-0 text-green-400" />
                  <span>Destaque regional para seu imóvel</span>
                </li>
                <li className="flex items-center space-x-3">
                  <DollarSign className="w-6 h-6 flex-shrink-0 text-red-400" />
                  <span>Melhor retorno do mercado</span>
                </li>
              </ul>
              <a 
                href="https://wa.me/5537999216351?text=Gostaria%20de%20anunciar%20minha%20casa%20no%20seu%20site!"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Anunciar Agora
              </a>
            </div>
            {/* Image with gradients */}
            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
              <img
                src="https://plus.unsplash.com/premium_photo-1661752229232-96232a11c62b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Anuncie seu imóvel"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/90 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/90 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>
      {/* Why Choose Us Section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Por Que Nos Escolher</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Building2 className="w-12 h-12 mx-auto text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ampla Variedade de Imóveis</h3>
            <p className="text-gray-600">Encontre o imóvel perfeito em nossa extensa coleção</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <MapPin className="w-12 h-12 mx-auto text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Localizações Privilegiadas</h3>
            <p className="text-gray-600">Imóveis nos bairros mais desejados</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <DollarSign className="w-12 h-12 mx-auto text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Melhores Preços do Mercado</h3>
            <p className="text-gray-600">Preços competitivos para venda e locação</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;