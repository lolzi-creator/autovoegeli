'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Calendar, Clock, User, Phone, Mail, MessageCircle, Car, Euro, Check, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';

interface RentalCar {
  id: string;
  name: string;
  brand: string;
  model: string;
  price_per_day: number;
  image_url: string | null;
  features: string[];
  transmission: string;
  fuel_type: string;
  seats: number;
  doors: number;
  airbags: number;
  abs: boolean;
  air_conditioning: boolean;
  bluetooth: boolean;
  navigation: boolean;
  max_weight: number | null;
  cargo_volume: string | null;
  engine_size: string;
  rental_categories: {
    id: string;
    name: string;
    description: string;
    color: string;
  };
}

interface RentalCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

// Dynamic rental data will be loaded from API

interface FormData {
  selectedCar: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: string;
  startDate: string;
  endDate: string;
  message: string;
  outsideSwitzerland: boolean | null;
}

const RentPage = () => {
  const { t, locale } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [rentalCars, setRentalCars] = useState<RentalCar[]>([]);
  const [rentalCategories, setRentalCategories] = useState<RentalCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    selectedCar: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    startDate: '',
    endDate: '',
    message: '',
    outsideSwitzerland: null as boolean | null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalDays, setTotalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load rental data
  useEffect(() => {
    const loadRentalData = async () => {
      try {
        const response = await fetch('/api/rental/public');
        const data = await response.json();
        
        if (data.categories && data.cars) {
          setRentalCategories(data.categories);
          setRentalCars(data.cars);
        }
      } catch (error) {
        console.error('Error loading rental data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRentalData();
  }, []);

  // Calculate rental duration
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        setTotalDays(diffDays);
      } else {
        setTotalDays(0);
      }
    }
  }, [formData.startDate, formData.endDate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleCarSelect = (carId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCar: carId
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedCarData = rentalCars.find(car => car.id === formData.selectedCar);
      
      // Create WhatsApp message
      const whatsappMessage = `🚗 *NEUE MIETANFRAGE - Auto Vögeli*

👤 *Kunde:*
${formData.firstName} ${formData.lastName}
📧 ${formData.email}
📱 ${formData.phone}
🎂 Alter: ${formData.age} Jahre

🚙 *Fahrzeug:*
${selectedCarData?.name || 'Nicht ausgewählt'}
${selectedCarData ? `(${selectedCarData.brand} ${selectedCarData.model})` : ''}
${selectedCarData ? `📋 Kategorie: ${selectedCarData.rental_categories?.name}` : ''}
${selectedCarData ? `⚙️ ${selectedCarData.transmission} | ${selectedCarData.fuel_type} | ${selectedCarData.seats} Sitze` : ''}

📅 *Mietdauer:*
Von: ${new Date(formData.startDate).toLocaleDateString('de-CH')}
Bis: ${new Date(formData.endDate).toLocaleDateString('de-CH')}
Dauer: ${totalDays} Tag${totalDays > 1 ? 'e' : ''}

💰 *Preis:*
ab 50 CHF/Tag (je nach Fahrzeug)

🌍 *Ausland:*
${formData.outsideSwitzerland ? '✅ Ja, wird außerhalb der Schweiz gefahren' : '❌ Nein, nur in der Schweiz'}

💬 *Nachricht:*
${formData.message || 'Keine zusätzliche Nachricht'}

---
Gesendet über autovoegeli.ch/mieten`;

      // WhatsApp number (replace with your actual WhatsApp business number)
      const whatsappNumber = "41792664262"; // Your phone number in international format
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank');
      
      // Reset form
      setFormData({
        selectedCar: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        age: '',
        startDate: '',
        endDate: '',
        message: '',
        outsideSwitzerland: null
      });
      
      alert('Ihre Anfrage wurde an WhatsApp weitergeleitet. Wir melden uns in Kürze bei Ihnen!');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Es gab einen Fehler beim Senden der Anfrage. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {!mounted ? 'Lade...' : 'Lade Mietfahrzeuge...'}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section style={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        paddingTop: '40px',
        paddingBottom: '40px'
      }}>
        <div className="container-width section-padding">
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '16px',
              letterSpacing: '-0.02em'
            }}>
              Fahrzeuge{' '}
              <span className="text-gradient">Mieten</span>
            </h1>
            <p style={{
              fontSize: '1.125rem',
              color: '#64748b',
              lineHeight: '1.7',
              marginBottom: '32px'
            }}>
              Flexible Mietlösungen für jeden Bedarf. Von kompakten Stadtautos bis zu luxuriösen Premium-Fahrzeugen - alles ab 60 CHF pro Tag.
            </p>

            {/* Benefits */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              marginBottom: '32px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#f0f9f4',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#059669'
              }}>
                <Check className="h-4 w-4" />
                <span>Vollkasko inklusive</span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#f0f9f4',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#059669'
              }}>
                <Check className="h-4 w-4" />
                <span>Flexible Mietdauer</span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#f0f9f4',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#059669'
              }}>
                <Check className="h-4 w-4" />
                <span>Faire Preise</span>
              </div>
            </div>
            
            {/* Trust Indicators */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '32px',
              flexWrap: 'wrap',
              paddingTop: '24px',
              borderTop: '1px solid #e2e8f0'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8bc442' }}>
                  ab 60 CHF
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  pro Tag
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8bc442' }}>
                  Sofort verfügbar
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  WhatsApp-Anfrage
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8bc442' }}>
                  4 Kategorien
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Kompakt bis Luxus
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stepper Header */}
      <div className="container-width section-padding" style={{ backgroundColor: 'white', paddingTop: '40px', paddingBottom: '40px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {[1, 2, 3].map((step) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => goToStep(step)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: currentStep >= step ? '#8bc442' : '#e5e7eb',
                  color: currentStep >= step ? 'white' : '#6b7280',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {step}
              </button>
              {step < 3 && (
                <div style={{
                  width: '40px',
                  height: '2px',
                  backgroundColor: currentStep > step ? '#8bc442' : '#e5e7eb',
                  transition: 'all 0.2s ease'
                }} />
              )}
            </div>
          ))}
        </div>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '8px'
          }}>
            {currentStep === 1 && 'Fahrzeug auswählen'}
            {currentStep === 2 && 'Persönliche Daten'}
            {currentStep === 3 && 'Übersicht & Bestätigung'}
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280'
          }}>
            {currentStep === 1 && 'Wählen Sie Ihr gewünschtes Mietfahrzeug aus'}
            {currentStep === 2 && 'Füllen Sie Ihre Daten und Mietdauer aus'}
            {currentStep === 3 && 'Überprüfen Sie Ihre Angaben und senden Sie die Anfrage'}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className="container-width section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Step 1: Car Selection */}
          {currentStep === 1 && (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 style={{
                  fontSize: '1.875rem',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '24px',
                  letterSpacing: '-0.01em'
                }}>
                  Wählen Sie Ihr Fahrzeug
                </h2>
              
              {/* Cars Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {rentalCars.map((car) => (
                  <div
                    key={car.id}
                    onClick={() => handleCarSelect(car.id)}
                    style={{
                      border: `2px solid ${formData.selectedCar === car.id ? '#8bc442' : '#e2e8f0'}`,
                      borderRadius: '16px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: formData.selectedCar === car.id ? '#f0f9f4' : 'white',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      if (formData.selectedCar !== car.id) {
                        e.currentTarget.style.borderColor = '#8bc442';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (formData.selectedCar !== car.id) {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {/* Selection indicator */}
                    {formData.selectedCar === car.id && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        width: '24px',
                        height: '24px',
                        backgroundColor: '#8bc442',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        ✓
                      </div>
                    )}
                    
                    <div style={{ 
                      position: 'relative', 
                      height: '160px', 
                      marginBottom: '16px', 
                      borderRadius: '12px', 
                      overflow: 'hidden', 
                      backgroundColor: '#f8fafc' 
                    }}>
                      <Image
                        src={car.image_url || '/homepage.jpg'}
                        alt={car.name}
                        fill={true}
                        style={{ objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: '#8bc442',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {car.rental_categories.name}
                      </div>
                    </div>
                    
                    <h3 style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '700', 
                      color: '#0f172a', 
                      marginBottom: '12px',
                      letterSpacing: '-0.01em'
                    }}>
                      {car.name}
                    </h3>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      marginBottom: '16px' 
                    }}>
                      <div style={{ 
                        fontSize: '1.75rem', 
                        fontWeight: '700', 
                        color: '#8bc442' 
                      }}>
                        ab 50 CHF
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#64748b',
                        fontWeight: '500'
                      }}>
                        pro Tag
                      </div>
                    </div>
                    
                    <div style={{ 
                      marginBottom: '16px',
                      padding: '12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        fontSize: '14px', 
                        color: '#64748b',
                        fontWeight: '500'
                      }}>
                        <Car style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                        <span>{car.transmission} | {car.fuel_type} | {car.seats} Sitze</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {car.features.map((feature, index) => (
                        <span
                          key={index}
                          style={{
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Vehicle Details - show only when selected */}
                    {formData.selectedCar === car.id && (
                      <div style={{
                        marginTop: '12px',
                        padding: '16px',
                        backgroundColor: formData.selectedCar === car.id ? '#f0f9f4' : '#f8fafc',
                        borderRadius: '8px',
                        border: `1px solid ${formData.selectedCar === car.id ? '#bbf7d0' : '#e2e8f0'}`
                      }}>
                        <h4 style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#065f46',
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ fontSize: '16px' }}>✓</span>
                          Technische Details
                          <span style={{ fontSize: '12px', fontWeight: '500', color: '#059669' }}>(Ausgewählt)</span>
                        </h4>
                        
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                          gap: '8px',
                          fontSize: '12px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Türen:</span>
                            <span style={{ fontWeight: '500', color: '#374151' }}>{car.doors}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Airbags:</span>
                            <span style={{ fontWeight: '500', color: '#374151' }}>{car.airbags}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Hubraum:</span>
                            <span style={{ fontWeight: '500', color: '#374151' }}>{car.engine_size}</span>
                          </div>
                          {car.max_weight && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#64748b' }}>Max. Gewicht:</span>
                              <span style={{ fontWeight: '500', color: '#374151' }}>{car.max_weight} kg</span>
                            </div>
                          )}
                          {car.cargo_volume && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#64748b' }}>Laderaum:</span>
                              <span style={{ fontWeight: '500', color: '#374151' }}>{car.cargo_volume}</span>
                            </div>
                          )}
                        </div>

                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                          <h5 style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '8px'
                          }}>
                            Ausstattung
                          </h5>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {car.abs && <span style={{ fontSize: '10px', color: '#059669', fontWeight: '500' }}>✓ ABS</span>}
                            {car.air_conditioning && <span style={{ fontSize: '10px', color: '#059669', fontWeight: '500' }}>✓ Klimaanlage</span>}
                            {car.bluetooth && <span style={{ fontSize: '10px', color: '#059669', fontWeight: '500' }}>✓ Bluetooth</span>}
                            {car.navigation && <span style={{ fontSize: '10px', color: '#059669', fontWeight: '500' }}>✓ Navigation</span>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Next Button */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginTop: '32px' 
              }}>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!formData.selectedCar}
                  style={{
                    backgroundColor: formData.selectedCar ? '#8bc442' : '#9ca3af',
                    color: 'white',
                    padding: '16px 32px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: formData.selectedCar ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  Weiter
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          )}

          {/* Step 2: Personal Details */}
          {currentStep === 2 && (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 style={{
                  fontSize: '1.875rem',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '24px',
                  letterSpacing: '-0.01em'
                }}>
                  Persönliche Daten & Mietdauer
                </h2>
                
                <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Personal Information */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '16px' 
                  }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#374151', 
                        marginBottom: '6px' 
                      }}>
                        Vorname *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          transition: 'all 0.2s ease',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#8bc442';
                          e.target.style.boxShadow = '0 0 0 3px rgba(139, 196, 66, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#374151', 
                        marginBottom: '6px' 
                      }}>
                        Nachname *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          transition: 'all 0.2s ease',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#8bc442';
                          e.target.style.boxShadow = '0 0 0 3px rgba(139, 196, 66, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#374151', 
                        marginBottom: '6px' 
                      }}>
                        E-Mail *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          transition: 'all 0.2s ease',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#8bc442';
                          e.target.style.boxShadow = '0 0 0 3px rgba(139, 196, 66, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#374151', 
                        marginBottom: '6px' 
                      }}>
                        Telefon *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          transition: 'all 0.2s ease',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#8bc442';
                          e.target.style.boxShadow = '0 0 0 3px rgba(139, 196, 66, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#374151', 
                        marginBottom: '6px' 
                      }}>
                        Alter (min. 21 Jahre) *
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        required
                        min="21"
                        max="99"
                        placeholder="z.B. 25"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          transition: 'all 0.2s ease',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#8bc442';
                          e.target.style.boxShadow = '0 0 0 3px rgba(139, 196, 66, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  {/* Outside Switzerland Selection */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '12px' 
                    }}>
                      Wird das Fahrzeug außerhalb der Schweiz gefahren? *
                    </label>
                    <div style={{ 
                      display: 'flex', 
                      gap: '16px',
                      flexWrap: 'wrap'
                    }}>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        cursor: 'pointer',
                        padding: '12px 16px',
                        backgroundColor: formData.outsideSwitzerland === true ? '#f0f9f4' : '#f8fafc',
                        border: `2px solid ${formData.outsideSwitzerland === true ? '#8bc442' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        transition: 'all 0.2s ease'
                      }}>
                        <input
                          type="radio"
                          name="outsideSwitzerland"
                          value="true"
                          checked={formData.outsideSwitzerland === true}
                          onChange={(e) => setFormData(prev => ({ ...prev, outsideSwitzerland: e.target.value === 'true' }))}
                          style={{
                            width: '18px',
                            height: '18px',
                            accentColor: '#8bc442'
                          }}
                        />
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: '500', 
                          color: '#374151'
                        }}>
                          Ja
                        </span>
                      </label>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        cursor: 'pointer',
                        padding: '12px 16px',
                        backgroundColor: formData.outsideSwitzerland === false ? '#f0f9f4' : '#f8fafc',
                        border: `2px solid ${formData.outsideSwitzerland === false ? '#8bc442' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        transition: 'all 0.2s ease'
                      }}>
                        <input
                          type="radio"
                          name="outsideSwitzerland"
                          value="false"
                          checked={formData.outsideSwitzerland === false}
                          onChange={(e) => setFormData(prev => ({ ...prev, outsideSwitzerland: e.target.value === 'true' }))}
                          style={{
                            width: '18px',
                            height: '18px',
                            accentColor: '#8bc442'
                          }}
                        />
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: '500', 
                          color: '#374151'
                        }}>
                          Nein
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Rental Dates */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '16px' 
                  }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#374151', 
                        marginBottom: '6px' 
                      }}>
                        Von *
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          transition: 'all 0.2s ease',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#8bc442';
                          e.target.style.boxShadow = '0 0 0 3px rgba(139, 196, 66, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#374151', 
                        marginBottom: '6px' 
                      }}>
                        Bis *
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          transition: 'all 0.2s ease',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#8bc442';
                          e.target.style.boxShadow = '0 0 0 3px rgba(139, 196, 66, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '6px' 
                    }}>
                      Nachricht (optional)
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Zusätzliche Wünsche oder Anmerkungen..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#8bc442';
                        e.target.style.boxShadow = '0 0 0 3px rgba(139, 196, 66, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Navigation Buttons */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginTop: '32px' 
                  }}>
                    <button
                      type="button"
                      onClick={prevStep}
                      style={{
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        padding: '16px 32px',
                        borderRadius: '12px',
                        border: 'none',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <ArrowRight className="w-5 h-5 rotate-180" />
                      Zurück
                    </button>
                    <button
                      type="submit"
                      disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.age || !formData.startDate || !formData.endDate || formData.outsideSwitzerland === null}
                      style={{
                        backgroundColor: (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.age || !formData.startDate || !formData.endDate || formData.outsideSwitzerland === null) ? '#9ca3af' : '#8bc442',
                        color: 'white',
                        padding: '16px 32px',
                        borderRadius: '12px',
                        border: 'none',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.age || !formData.startDate || !formData.endDate || formData.outsideSwitzerland === null) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      Weiter
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 style={{
                  fontSize: '1.875rem',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '24px',
                  letterSpacing: '-0.01em'
                }}>
                  Übersicht & Bestätigung
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  {/* Selected Car */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '16px'
                    }}>
                      Ausgewähltes Fahrzeug
                    </h3>
                    {(() => {
                      const selectedCar = rentalCars.find(car => car.id === formData.selectedCar);
                      return selectedCar ? (
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                            {selectedCar.name}
                          </div>
                          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                            {selectedCar.brand} {selectedCar.model}
                          </div>
                          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                            {selectedCar.transmission} | {selectedCar.fuel_type} | {selectedCar.seats} Sitze
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#8bc442' }}>
                            ab 50 CHF/Tag
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: '#6b7280' }}>Kein Fahrzeug ausgewählt</div>
                      );
                    })()}
                  </div>

                  {/* Rental Details */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '16px'
                    }}>
                      Mietdauer
                    </h3>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                      Von: {new Date(formData.startDate).toLocaleDateString('de-CH')}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                      Bis: {new Date(formData.endDate).toLocaleDateString('de-CH')}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                      {totalDays} Tag{totalDays > 1 ? 'e' : ''}
                    </div>
                  </div>

                  {/* Personal Details */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '16px'
                    }}>
                      Ihre Daten
                    </h3>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                      {formData.firstName} {formData.lastName}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                      {formData.email}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                      {formData.phone}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                      Alter: {formData.age} Jahre
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                      Auslandsfahrt: {formData.outsideSwitzerland ? 'Ja' : 'Nein'}
                    </div>
                    {formData.outsideSwitzerland && (
                      <div style={{ fontSize: '14px', color: '#dc2626', fontWeight: '500' }}>
                        ⚠️ Zusätzliche Gebühren können anfallen
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginTop: '32px' 
                }}>
                  <button
                    type="button"
                    onClick={prevStep}
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      padding: '16px 32px',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                    Zurück
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: isSubmitting ? '#9ca3af' : '#8bc442',
                      color: 'white',
                      padding: '16px 32px',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {isSubmitting ? 'Wird gesendet...' : 'Anfrage senden'}
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Right Column - Rental Form (Hidden in stepper mode) */}
          {false && (
          <div className="lg:col-span-1">
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e2e8f0',
              padding: '32px',
              position: 'sticky',
              top: '96px'
            }}>
              <h2 style={{
                fontSize: '1.875rem',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '24px',
                letterSpacing: '-0.01em'
              }}>
                Mietanfrage
              </h2>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Personal Information */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '16px' 
                }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '6px' 
                    }}>
                      Vorname *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#8bc442';
                        e.target.style.boxShadow = '0 0 0 3px rgba(139, 196, 66, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '6px' 
                    }}>
                      Nachname *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#8bc442';
                        e.target.style.boxShadow = '0 0 0 3px rgba(139, 196, 66, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '6px' 
                  }}>
                    E-Mail *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8bc442';
                      e.target.style.boxShadow = '0 0 0 3px rgba(139, 196, 66, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '6px' 
                  }}>
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8bc442';
                      e.target.style.boxShadow = '0 0 0 3px rgba(139, 196, 66, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '6px' 
                  }}>
                    Alter (min. 21 Jahre) *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                    min="21"
                    max="99"
                    placeholder="z.B. 25"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8bc442';
                      e.target.style.boxShadow = '0 0 0 3px rgba(139, 196, 66, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Outside Switzerland Checkbox */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <input
                    type="checkbox"
                    name="outsideSwitzerland"
                    checked={formData.outsideSwitzerland || false}
                    onChange={handleInputChange}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: '#8bc442'
                    }}
                  />
                  <label style={{ 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#374151',
                    cursor: 'pointer'
                  }}>
                    Das Fahrzeug wird außerhalb der Schweiz gefahren
                  </label>
                </div>

                {/* Rental Dates */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '16px' 
                }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '6px' 
                    }}>
                      Von *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#8bc442';
                        e.target.style.boxShadow = '0 0 0 3px rgba(139, 196, 66, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '6px' 
                    }}>
                      Bis *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#8bc442';
                        e.target.style.boxShadow = '0 0 0 3px rgba(139, 196, 66, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* Price Summary */}
                {totalDays > 0 && formData.selectedCar && (
                  <div style={{
                    backgroundColor: '#f0f9f4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <h4 style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#065f46', 
                      marginBottom: '16px' 
                    }}>
                      Preisübersicht
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        fontSize: '14px',
                        color: '#374151'
                      }}>
                        <span>Mietdauer:</span>
                        <span style={{ fontWeight: '500' }}>{totalDays} Tag{totalDays > 1 ? 'e' : ''}</span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        fontSize: '14px',
                        color: '#374151'
                      }}>
                        <span>Preis pro Tag:</span>
                        <span style={{ fontWeight: '500' }}>{rentalCars.find(car => car.id === formData.selectedCar)?.price_per_day} CHF</span>
                      </div>
                      <div style={{ 
                        borderTop: '1px solid #bbf7d0', 
                        paddingTop: '12px', 
                        marginTop: '8px' 
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          fontSize: '16px',
                          fontWeight: '700', 
                          color: '#065f46' 
                        }}>
                          <span>Gesamtpreis:</span>
                          <span>{totalPrice} CHF</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '6px' 
                  }}>
                    Nachricht (optional)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Zusätzliche Wünsche oder Anmerkungen..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8bc442';
                      e.target.style.boxShadow = '0 0 0 3px rgba(139, 196, 66, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !formData.selectedCar || !formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.age || !formData.startDate || !formData.endDate}
                  style={{
                    width: '100%',
                    backgroundColor: isSubmitting || !formData.selectedCar || !formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.age || !formData.startDate || !formData.endDate ? '#9ca3af' : '#8bc442',
                    color: 'white',
                    fontWeight: '600',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '16px',
                    cursor: isSubmitting || !formData.selectedCar || !formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.age || !formData.startDate || !formData.endDate ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting && formData.selectedCar && formData.firstName && formData.lastName && formData.email && formData.phone && formData.age && formData.startDate && formData.endDate) {
                      e.currentTarget.style.backgroundColor = '#72a035';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting && formData.selectedCar && formData.firstName && formData.lastName && formData.email && formData.phone && formData.age && formData.startDate && formData.endDate) {
                      e.currentTarget.style.backgroundColor = '#8bc442';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <MessageCircle style={{ width: '20px', height: '20px' }} />
                  <span>{isSubmitting ? 'Wird gesendet...' : 'Anfrage via WhatsApp senden'}</span>
                </button>
              </form>

              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                marginTop: '16px',
                textAlign: 'center',
                lineHeight: '1.5'
              }}>
                Ihre Anfrage wird direkt an unser WhatsApp weitergeleitet. Wir melden uns schnellstmöglich bei Ihnen.
              </p>
            </div>
          </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RentPage;

