'use client';

import { useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Service } from '@/types';
import servicesData from '@/data/services.json';
import currenciesData from '@/data/currencies.json';

const allServices = servicesData as Service[];

export default function ServicesList() {
  const { selectedCountry, selectedVAC, selectedCurrency, cart, addToCart, updateCartQuantity } = useAppContext();

  const services = useMemo(() => {
    if (!selectedCountry) return [];
    return allServices.filter((s) => s.Country_Code === selectedCountry.Country_Code);
  }, [selectedCountry]);

  const symbol = selectedCurrency?.Currency_Symbol ?? '₹';

  const getCartQty = (serviceCode: string) =>
    cart.find((i) => i.service.Service_Code === serviceCode)?.quantity ?? 0;

  const handleAdd = (service: Service) => {
    const existing = cart.find((i) => i.service.Service_Code === service.Service_Code);
    if (existing) {
      updateCartQuantity(service.Service_Code, existing.quantity + 1);
    } else {
      addToCart({ service, quantity: 1, line_total: service.Unit_Price });
    }
  };

  const handleDecrement = (service: Service) => {
    const existing = cart.find((i) => i.service.Service_Code === service.Service_Code);
    if (!existing) return;
    updateCartQuantity(service.Service_Code, existing.quantity - 1);
  };

  // ── not selected state ──────────────────────────────────────────────────────
  if (!selectedCountry || !selectedVAC) {
    return (
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '6px',
          padding: '20px',
        }}
      >
        <SectionHeader count={0} />
        <div
          style={{
            marginTop: '16px',
            padding: '32px',
            backgroundColor: '#F8FAFC',
            border: '1px dashed #CBD5E1',
            borderRadius: '5px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '13px', color: '#94A3B8' }}>
            Select a country and VAC to load available services.
          </div>
        </div>
      </div>
    );
  }

  // ── no services for country ─────────────────────────────────────────────────
  if (services.length === 0) {
    return (
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '6px',
          padding: '20px',
        }}
      >
        <SectionHeader count={0} />
        <div
          style={{
            marginTop: '16px',
            padding: '32px',
            backgroundColor: '#FFF7ED',
            border: '1px solid #FED7AA',
            borderRadius: '5px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '13px', color: '#92400E' }}>
            No services configured for {selectedCountry.Country_Name}.
          </div>
        </div>
      </div>
    );
  }

  // ── services list ───────────────────────────────────────────────────────────
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '6px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Available Services</div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
            {services.length} service{services.length !== 1 ? 's' : ''} for {selectedCountry.Country_Name}
          </div>
        </div>
        <span
          style={{
            fontSize: '11px',
            backgroundColor: '#F1F5F9',
            color: '#475569',
            padding: '2px 8px',
            borderRadius: '20px',
            fontWeight: 600,
          }}
        >
          VAS
        </span>
      </div>

      {/* Column headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 90px 120px 40px',
          gap: '0',
          padding: '8px 20px',
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        {['Service', 'Unit Price', 'Quantity', ''].map((h) => (
          <div
            key={h}
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: '#94A3B8',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div>
        {services.map((service, idx) => {
          const qty = getCartQty(service.Service_Code);
          const inCart = qty > 0;

          return (
            <div
              key={service.Service_Code}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 90px 120px 40px',
                alignItems: 'center',
                padding: '12px 20px',
                borderBottom: idx < services.length - 1 ? '1px solid #F1F5F9' : 'none',
                backgroundColor: inCart ? '#F0F9FF' : '#FFFFFF',
                transition: 'background-color 0.15s',
              }}
            >
              {/* Service info */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A' }}>
                  {service.Service_Name}
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>
                  {service.Service_Code}
                </div>
              </div>

              {/* Unit price */}
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E3A5F' }}>
                {symbol} {service.Unit_Price.toFixed(2)}
              </div>

              {/* Stepper */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                <button
                  onClick={() => handleDecrement(service)}
                  disabled={qty === 0}
                  style={{
                    width: '28px',
                    height: '28px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '4px 0 0 4px',
                    backgroundColor: qty === 0 ? '#F8FAFC' : '#FFFFFF',
                    color: qty === 0 ? '#CBD5E1' : '#475569',
                    cursor: qty === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 500,
                  }}
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <div
                  style={{
                    width: '36px',
                    height: '28px',
                    border: '1px solid #E2E8F0',
                    borderLeft: 'none',
                    borderRight: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: inCart ? '#1E3A5F' : '#94A3B8',
                    backgroundColor: inCart ? '#EFF6FF' : '#F8FAFC',
                  }}
                >
                  {qty}
                </div>

                <button
                  onClick={() => handleAdd(service)}
                  style={{
                    width: '28px',
                    height: '28px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '0 4px 4px 0',
                    backgroundColor: '#1E3A5F',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '16px',
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 500,
                  }}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Line total — only when in cart */}
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: inCart ? '#1E3A5F' : 'transparent',
                  textAlign: 'right',
                  whiteSpace: 'nowrap',
                }}
              >
                {symbol} {(service.Unit_Price * qty).toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeader({ count }: { count: number }) {
  return (
    <div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Available Services</div>
      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
        {count > 0 ? `${count} services available` : 'No services loaded'}
      </div>
    </div>
  );
}
