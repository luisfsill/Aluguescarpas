import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  Phone, 
  Mail, 
  School as Pool, 
  Trees as Tree, 
  Car, 
  Shield, 
  Wind, 
  Refrigerator, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft 
} from 'lucide-react';
import { FaSwimmingPool } from "react-icons/fa";
import { useSwipeable } from 'react-swipeable';
import { getProperty } from '../services/api';
import type { Property } from '../types/property';

function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        if (!id) {
          setError('ID do imóvel não encontrado');
          return;
        }
        const propertyData = await getProperty(id);
        setProperty(propertyData);
      } catch (err) {
        console.error('Erro ao carregar imóvel:', err);
        setError('Erro ao carregar informações do imóvel');
      } finally {
        setIsLoading(false);
      }
    };
    loadProperty();
  }, [id]);

  const formatPhoneNumber = (phone: string) => {
    const numericPhone = phone.replace(/\D/g, '');
    if (numericPhone.length === 11) {
      return `(${numericPhone.slice(0, 2)}) ${numericPhone.slice(2, 7)}-${numericPhone.slice(7)}`;
    }
    return phone;
  };

  const getWhatsAppLink = (phone: string) => {
    const numericPhone = phone.replace(/\D/g, '');
    return `https://wa.me/55${numericPhone}?text=Olá! Vi seu anúncio do imóvel "${property?.title}" e gostaria de mais informações.`;
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!property?.images) return;
    setCurrentImageIndex(prev => prev === 0 ? property.images.length - 1 : prev - 1);
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!property?.images) return;
    setCurrentImageIndex(prev => prev === property.images.length - 1 ? 0 : prev + 1);
  };

  const openGallery = (index: number) => {
    setCurrentImageIndex(index);
    setShowGallery(true);
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setShowGallery(false);
    document.body.style.overflow = 'auto';
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNextImage(),
    onSwipedRight: () => handlePrevImage(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!showGallery) return;
      if (e.key === 'Escape') {
        closeGallery();
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showGallery, property?.images?.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Carregando informações do imóvel...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ops! Algo deu errado</h2>
          <p className="text-gray-600">{error || 'Imóvel não encontrado'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 px-4 sm:px-0">
        {/* Back Button */}
        <Link
          to="/properties"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors group mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Voltar</span>
        </Link>
        {/* Thumbnail Gallery */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {property.images.slice(0, 3).map((image, index) => (
            <div 
              key={index} 
              className="relative cursor-pointer aspect-square group"
              onClick={() => openGallery(index)}
            >
              <img
                src={image}
                alt={`${property.title} - Imagem ${index + 1}`}
                className="w-full h-full object-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
              />
              {index === 2 && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-sm bg-black bg-opacity-50 rounded-lg duration-200 group-hover:scale-105">
                  Mais fotos
                </div>
              )}
              <div className="absolute inset-0 bg-opacity-0 group-hover bg-opacity-20 transition-opacity rounded-lg" />
            </div>
          ))}
        </div>
        {/* Property Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{property.title}</h1>
              <div className="flex items-center text-gray-600 mt-2">
                <MapPin className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{property.location}</span>
              </div>
            </div>
            {/* Property Stats */}
            <div className="grid grid-cols-3 text-center text-gray-600 bg-gray-50 p-4 rounded-lg">
              <div className="space-y-1">
                <Bed className="w-6 h-6 mx-auto text-blue-600" />
                <div className="font-semibold">{property.bedrooms}</div>
                <div className="text-sm">Quartos</div>
              </div>
              <div className="space-y-1">
                <Bath className="w-6 h-6 mx-auto text-blue-600" />
                <div className="font-semibold">{property.bathrooms}</div>
                <div className="text-sm">Banheiros</div>
              </div>
              <div className="space-y-1">
                <Square className="w-6 h-6 mx-auto text-blue-600" />
                <div className="font-semibold">{property.area}</div>
                <div className="text-sm">m²</div>
              </div>
            </div>
            {/* Description */}
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">Descrição</h2>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>
            {/* Features */}
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">Características</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {property.features.has_pool && (
  <div className="flex items-center text-gray-600">
    <FaSwimmingPool className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" />
    <span>Piscina</span>
  </div>
)}
                {property.features.has_garden && (
                  <div className="flex items-center text-gray-600">
                    <Tree className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" />
                    <span>Jardim</span>
                  </div>
                )}
                {property.features.has_garage && (
                  <div className="flex items-center text-gray-600">
                    <Car className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" />
                    <span>Garagem</span>
                  </div>
                )}
                {property.features.has_security_system && (
                  <div className="flex items-center text-gray-600">
                    <Shield className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" />
                    <span>Sistema de Segurança</span>
                  </div>
                )}
                {property.features.has_air_conditioning && (
                  <div className="flex items-center text-gray-600">
                    <Wind className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" />
                    <span>Ar Condicionado Central</span>
                  </div>
                )}
                {property.features.has_premium_appliances && (
                  <div className="flex items-center text-gray-600">
                    <Refrigerator className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" />
                    <span>Eletrodomésticos de Alto Padrão</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-2xl font-bold text-blue-600 mb-4">
                {`R$ ${property.price.toLocaleString('pt-BR')}${property.type === 'rent' ? '/mês' : ''}`}
              </div>
              {property.brokerPhone && (
                <a 
                  href={getWhatsAppLink(property.brokerPhone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  Entrar em Contato
                </a>
              )}
            </div>
            {/* Contact Card */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Contatar Corretor</h3>
              <div className="space-y-4">
                {property.brokerPhone && (
                  <a 
                    href={`tel:${property.brokerPhone}`}
                    className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Phone className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>{formatPhoneNumber(property.brokerPhone)}</span>
                  </a>
                )}
                {property.brokerEmail && (
                  <a 
                    href={`mailto:${property.brokerEmail}`}
                    className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Mail className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>{property.brokerEmail}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Full Screen Gallery Modal */}
      {showGallery && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeGallery}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={closeGallery}
          >
            <X className="w-8 h-8" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-20"
            onClick={handlePrevImage}
          >
            <ChevronLeft className="w-12 h-12" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-20"
            onClick={handleNextImage}
          >
            <ChevronRight className="w-12 h-12" />
          </button>
          <div className="relative w-full h-full flex flex-col items-center justify-center px-4">
            {/* Main Image with Swipe Support */}
            <div 
              {...swipeHandlers}
              className="relative w-full h-[calc(100vh-200px)] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={property.images[currentImageIndex]}
                alt={`${property.title} - Imagem ${currentImageIndex + 1}`}
                className="max-h-full max-w-full object-contain select-none"
              />
            </div>
            {/* Thumbnails at the bottom */}
            <div className="absolute bottom-2 left-0 right-0">
              <div className="flex flex-col items-center space-y-4">
                {/* Thumbnails Scroll Container */}
                <div className="relative w-full max-w-4xl mx-auto px-4">
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-4">
                    {property.images.map((image, index) => (
                      <div
                        key={index}
                        className={`relative flex-shrink-0 cursor-pointer transition-all duration-200 ${
                          index === currentImageIndex 
                            ? 'w-20 h-20 ring-2 ring-white opacity-100' 
                            : 'w-16 h-16 opacity-60 hover:opacity-100'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PropertyDetails;