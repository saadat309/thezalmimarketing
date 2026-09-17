import React, { useState, useEffect, useMemo } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calculator, MapPin, Building2, FileText, UserCheck, ShieldCheck, CreditCard, DollarSign, ArrowRight, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2, Plus, Trash2, Info, Printer, Download, FileCode, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import content from '@/content/pages/calculator.json';

export const Route = createFileRoute('/calculator')({
  head: () => ({
    meta: [
      { title: content.seo.title },
      { name: 'description', content: content.seo.description },
      { name: 'keywords', content: content.seo.keywords },
      { property: 'og:type', content: content.seo.ogType },
      { property: 'og:url', content: content.seo.ogUrl },
      { property: 'og:title', content: content.seo.ogTitle },
      { property: 'og:description', content: content.seo.ogDescription },
      { property: 'og:image', content: content.seo.ogImage },
      { name: 'twitter:card', content: content.seo.twitterCard },
      { name: 'twitter:url', content: content.seo.twitterUrl },
      { name: 'twitter:title', content: content.seo.twitterTitle },
      { name: 'twitter:description', content: content.seo.twitterDescription },
      { name: 'twitter:image', content: content.seo.twitterImage },
    ],
    links: [
      { rel: 'canonical', href: 'https://thezalmimarketing.com/calculator' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Zalmi Calculator",
          "url": "https://thezalmimarketing.com/calculator",
          "applicationCategory": "RealEstateApplication",
          "operatingSystem": "All",
          "description": "Official DHA Transfer Calculator and Property Tax Expense Estimator by The Zalmi Marketing Lahore.",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "PKR"
          },
          "provider": {
            "@type": "RealEstateAgent",
            "name": "The Zalmi Marketing",
            "url": "https://thezalmimarketing.com"
          }
        }),
      },
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://thezalmimarketing.com/" },
            { "@type": "ListItem", "position": 2, "name": "Zalmi Calculator", "item": "https://thezalmimarketing.com/calculator" }
          ]
        }),
      },
    ],
  }),
  component: PropertyTransferCalculatorPage,
});

function PropertyTransferCalculatorPage() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [error, setError] = useState(null);

  // Wizard Step (1: Location & Who is Paying, 2: Property, 3: Transfer & Options)
  const [step, setStep] = useState(1);
  const [showResults, setShowResults] = useState(false);

  // Form State — Step 1: Location & Who is Paying
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedSocietyId, setSelectedSocietyId] = useState('');
  const [selectedPhaseId, setSelectedPhaseId] = useState('');
  const [selectedBlockId, setSelectedBlockId] = useState('');
  const [whoIsPaying, setWhoIsPaying] = useState('Purchaser'); // Purchaser, Seller

  // Form State — Step 2: Property
  const [category, setCategory] = useState('Residential');
  const [propertyTypeId, setPropertyTypeId] = useState('');
  const [propertySize, setPropertySize] = useState('5');
  const [propertySizeUnit, setPropertySizeUnit] = useState('Marla'); // Marla, Kanal, Sq. Yards
  const [coveredArea, setCoveredArea] = useState('');

  // Form State — Step 3: Transfer Options
  const [transferType, setTransferType] = useState('Regular'); // Regular, Urgent, Executive, Hiba, Biana Only
  const [numberOfOwners, setNumberOfOwners] = useState('1');
  const [taxpayer, setTaxpayer] = useState('Filer'); // Filer, Non-Filer
  const [verification, setVerification] = useState('Required'); // Required, Not Required
  const [bianaIncluded, setBianaIncluded] = useState('Included'); // Included, Not Included
  const [agreementType, setAgreementType] = useState('Simple'); // Simple, DC Value
  const [stampDutyPayment, setStampDutyPayment] = useState('Online'); // Online, Bank

  // Client-side overrides for expense line amounts (keyed by line label)
  const [expenseOverrides, setExpenseOverrides] = useState({});
  const [customDcRate, setCustomDcRate] = useState('');
  const [customFbrRate, setCustomFbrRate] = useState('');

  // Deleted standard or custom expense line labels / IDs
  const [deletedLines, setDeletedLines] = useState([]);

  // Custom user-added expense lines (client-side only)
  const [customExpenses, setCustomExpenses] = useState([]);
  const [newCustomLabel, setNewCustomLabel] = useState('');
  const [newCustomAmount, setNewCustomAmount] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true);
        const res = await apiFetch('/calculator-config');
        if (!res.ok) throw new Error('Failed to load calculator configuration');
        const data = await res.json();
        setConfig(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Error connecting to calculator API');
        toast.error('Failed to load calculator configuration');
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  // Filtered options based on hierarchy
  const availableSocieties = useMemo(() => {
    if (!config || !selectedCityId) return [];
    const phaseSocietyIds = new Set(
      config.calculator_phases
        .filter(p => String(p.city_id) === String(selectedCityId))
        .map(p => String(p.society_id))
    );
    return config.societies.filter(s => phaseSocietyIds.has(String(s.id)));
  }, [config, selectedCityId]);

  const availablePhases = useMemo(() => {
    if (!config || !selectedCityId || !selectedSocietyId) return [];
    return config.calculator_phases.filter(
      p => String(p.city_id) === String(selectedCityId) && String(p.society_id) === String(selectedSocietyId)
    );
  }, [config, selectedCityId, selectedSocietyId]);

  const availableBlocks = useMemo(() => {
    if (!config || !selectedPhaseId) return [];
    return config.calculator_blocks.filter(b => String(b.calculator_phase_id) === String(selectedPhaseId));
  }, [config, selectedPhaseId]);

  const hasBlocksForSelectedPhase = availableBlocks.length > 0;

  // Property Types filtered by Category
  const availablePropertyTypes = useMemo(() => {
    if (!config) return [];
    return config.calculator_property_types.filter(pt => pt.category.toLowerCase() === category.toLowerCase());
  }, [config, category]);

  const selectedPropertyTypeObj = useMemo(() => {
    if (!config || !propertyTypeId) return null;
    return config.calculator_property_types.find(pt => String(pt.id) === String(propertyTypeId));
  }, [config, propertyTypeId]);

  const propertyTypeName = selectedPropertyTypeObj ? selectedPropertyTypeObj.property_type : '';
  const isCoveredAreaRequired = ['House', 'Appartment', 'Plaza/Building', 'Shop'].includes(propertyTypeName);

  const selectedCityObj = config?.cities.find(c => String(c.id) === String(selectedCityId));
  const selectedSocietyObj = config?.societies.find(s => String(s.id) === String(selectedSocietyId));
  const selectedPhaseObj = config?.calculator_phases.find(p => String(p.id) === String(selectedPhaseId));
  const selectedBlockObj = config?.calculator_blocks.find(b => String(b.id) === String(selectedBlockId));

  // Reset dependent fields when parent selection changes
  const handleCityChange = (val) => {
    setSelectedCityId(val);
    setSelectedSocietyId('');
    setSelectedPhaseId('');
    setSelectedBlockId('');
  };

  const handleSocietyChange = (val) => {
    setSelectedSocietyId(val);
    setSelectedPhaseId('');
    setSelectedBlockId('');
  };

  const handlePhaseChange = (val) => {
    setSelectedPhaseId(val);
    setSelectedBlockId('');
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPropertyTypeId('');
  };

  // Fee Helper from config
  const getFeeValue = (key, defaultVal) => {
    if (!config || !config.calculator_fees) return defaultVal;
    const found = config.calculator_fees.find(f => f.fee_key === key);
    return found ? parseFloat(found.amount) : defaultVal;
  };

  const getTaxRate = (key, defaultVal) => {
    if (!config || !config.calculator_tax_rates) return defaultVal;
    const found = config.calculator_tax_rates.find(t => t.rate_key === key);
    return found ? parseFloat(found.rate) : defaultVal;
  };

  // Calculations
  const calculationResult = useMemo(() => {
    if (!config) return null;

    // Fees configuration
    const defaultBiana = getFeeValue('biana', 4000);
    const verificationFee = getFeeValue('verification', 5250);
    const transferFilePlotFile = getFeeValue('transfer_file_plot_file', 7000);
    const transferFileOther = getFeeValue('transfer_file_other', 8000);
    const membershipFormFee = getFeeValue('membership_form', 2100);
    const agreementSimpleFee = getFeeValue('agreement_simple', 4000);
    const sportsFundFee = getFeeValue('sports_fund', 10500);
    const urgentFeeRate = getFeeValue('urgent_fee', 70000);
    const executiveFeeRate = getFeeValue('executive_fee', 80000);
    const mutationFee = getFeeValue('mutation', 300);
    const plraServiceFee = getFeeValue('plra_service', 3600);
    const plraMutationFee = getFeeValue('plra_mutation', 200);
    const onlinePsidFee = getFeeValue('online_psid', 15);

    // Dynamic Membership Fee calculation from calculator_fee_rules
    const getMembershipFeeAmount = (cat, sizeMarla) => {
      if (!config || !config.calculator_fee_rules || config.calculator_fee_rules.length === 0) {
        const isRes = cat.toLowerCase() === 'residential';
        if (isRes) {
          if (sizeMarla <= 10) return 75000;
          if (sizeMarla < 40) return 150000;
          return 200000;
        } else {
          if (sizeMarla <= 4) return 150000;
          return 200000;
        }
      }

      const propType = cat.toLowerCase() === 'residential' ? 'Residential' : 'Commercial';
      const applicableRules = config.calculator_fee_rules.filter(
        r => r.is_active !== 0 && r.property_type.toLowerCase() === propType.toLowerCase()
      );

      if (applicableRules.length === 0) {
        return cat.toLowerCase() === 'residential' ? 150000 : 200000;
      }

      for (const rule of applicableRules) {
        const unit = (rule.unit || 'marla').toLowerCase();
        const areaInRuleUnit = unit === 'kanal' ? (sizeMarla / 20) : sizeMarla;
        const min = parseFloat(rule.min_area || 0);
        const max = rule.max_area !== null && rule.max_area !== undefined ? parseFloat(rule.max_area) : null;

        if (max !== null) {
          if (min === 0) {
            if (areaInRuleUnit <= max) return parseFloat(rule.fee_amount);
          } else {
            if (areaInRuleUnit > min && areaInRuleUnit < max) return parseFloat(rule.fee_amount);
          }
        } else {
          if (propType.toLowerCase() === 'residential') {
            if (areaInRuleUnit >= min) return parseFloat(rule.fee_amount);
          } else {
            if (areaInRuleUnit > min) return parseFloat(rule.fee_amount);
          }
        }
      }

      return cat.toLowerCase() === 'residential' ? 150000 : 200000;
    };

    // Tax rates
    const sellerFilerRate = getTaxRate('seller_236c_filer', 2.75);
    const sellerNonFilerRate = getTaxRate('seller_236c_non_filer', 11.5);
    const purchaserFilerRate = getTaxRate('purchaser_236k_filer', 1.25);
    const purchaserNonFilerRate = getTaxRate('purchaser_236k_non_filer', 10.5);

    const ownersCount = Math.max(1, parseInt(numberOfOwners) || 1);
    const sizeVal = parseFloat(propertySize) || 0;
    const coveredAreaVal = parseFloat(coveredArea) || 0;

    // Convert property size to Marla & SqFt
    let propertySizeMarla = sizeVal;
    if (propertySizeUnit === 'Kanal') {
      propertySizeMarla = sizeVal * 20;
    } else if (propertySizeUnit === 'Sq. Yards') {
      propertySizeMarla = sizeVal / 27.225;
    }

    // 1. Find DC/FBR Rate
    let matchedRate = null;
    let rateFound = false;
    if (selectedPhaseId && propertyTypeId) {
      if (selectedBlockId) {
        matchedRate = config.calculator_rates.find(
          r => String(r.calculator_phase_id) === String(selectedPhaseId) &&
               String(r.calculator_block_id || '') === String(selectedBlockId) &&
               String(r.calculator_property_type_id) === String(propertyTypeId)
        );
      }
      if (!matchedRate) {
        matchedRate = config.calculator_rates.find(
          r => String(r.calculator_phase_id) === String(selectedPhaseId) &&
               (!r.calculator_block_id) &&
               String(r.calculator_property_type_id) === String(propertyTypeId)
        );
      }
      if (matchedRate) {
        rateFound = true;
      }
    }

    let dcPerMarla = 0, dcPerSqFt = 0, fbrPerMarla = 0, fbrPerSqFt = 0;
    if (matchedRate) {
      dcPerMarla = parseFloat(matchedRate.dc_per_marla || 0);
      dcPerSqFt = parseFloat(matchedRate.dc_per_sqft || 0);
      fbrPerMarla = parseFloat(matchedRate.fbr_per_marla || 0);
      fbrPerSqFt = parseFloat(matchedRate.fbr_per_sqft || 0);
    }

    if (customDcRate !== '' && !isNaN(parseFloat(customDcRate))) {
      if (isCoveredAreaRequired) {
        dcPerSqFt = parseFloat(customDcRate);
      } else {
        dcPerMarla = parseFloat(customDcRate);
      }
    }
    if (customFbrRate !== '' && !isNaN(parseFloat(customFbrRate))) {
      if (isCoveredAreaRequired) {
        fbrPerSqFt = parseFloat(customFbrRate);
      } else {
        fbrPerMarla = parseFloat(customFbrRate);
      }
    }

    if (matchedRate || (customDcRate !== '' && !isNaN(parseFloat(customDcRate))) || (customFbrRate !== '' && !isNaN(parseFloat(customFbrRate)))) {
      rateFound = true;
    }

    // Calculate DC and FBR Values
    let dcValue = 0;
    let fbrValue = 0;

    if (isCoveredAreaRequired && coveredAreaVal > 0) {
      const effectiveDcSqFt = dcPerSqFt > 0 ? dcPerSqFt : (dcPerMarla > 0 ? dcPerMarla / 225 : 0);
      const effectiveFbrSqFt = fbrPerSqFt > 0 ? fbrPerSqFt : (fbrPerMarla > 0 ? fbrPerMarla / 225 : 0);
      dcValue = coveredAreaVal * effectiveDcSqFt;
      fbrValue = coveredAreaVal * effectiveFbrSqFt;
    } else {
      const effectiveDcMarla = dcPerMarla > 0 ? dcPerMarla : (dcPerSqFt > 0 ? dcPerSqFt * 225 : 0);
      const effectiveFbrMarla = fbrPerMarla > 0 ? fbrPerMarla : (fbrPerSqFt > 0 ? fbrPerSqFt * 225 : 0);
      dcValue = propertySizeMarla * effectiveDcMarla;
      fbrValue = propertySizeMarla * effectiveFbrMarla;
    }

    // 2. Transfer Fee Reference
    let matchedTransferFeeRef = null;
    if (selectedPhaseId) {
      if (selectedBlockId) {
        matchedTransferFeeRef = config.calculator_transfer_fees.find(
          tf => String(tf.calculator_phase_id) === String(selectedPhaseId) &&
                String(tf.calculator_block_id || '') === String(selectedBlockId) &&
                tf.category.toLowerCase() === category.toLowerCase()
        );
      }
      if (!matchedTransferFeeRef) {
        matchedTransferFeeRef = config.calculator_transfer_fees.find(
          tf => String(tf.calculator_phase_id) === String(selectedPhaseId) &&
                (!tf.calculator_block_id) &&
                tf.category.toLowerCase() === category.toLowerCase()
        );
      }
    }

    let baseTransferFee = 0;
    let finalTransferFee = 0;
    let transferFeeExplanation = 'Calculated from location/category reference transfer fee rate.';
    if (matchedTransferFeeRef) {
      const refAmount = parseFloat(matchedTransferFeeRef.reference_amount || 0);
      const refSize = parseFloat(matchedTransferFeeRef.reference_size || 0);
      const refUnit = (matchedTransferFeeRef.reference_unit || 'marla').toLowerCase();
      
      const baseFeeRef = Math.max(0, refAmount - sportsFundFee);
      let refMarla = refSize;
      let refSqFt = refSize * 225;
      if (refUnit === 'sqft') {
        refSqFt = refSize;
        refMarla = refSize / 225;
      }

      const perMarlaRate = refMarla > 0 ? (baseFeeRef / refMarla) : 0;
      const perSqFtRate = refSqFt > 0 ? (baseFeeRef / refSqFt) : 0;

      baseTransferFee = (matchedTransferFeeRef.reference_unit === 'sqft' && isCoveredAreaRequired && coveredAreaVal > 0)
        ? coveredAreaVal * perSqFtRate
        : propertySizeMarla * perMarlaRate;

      finalTransferFee = baseTransferFee + sportsFundFee;
    } else {
      const isCommercialOrShop = category.toLowerCase() === 'commercial' || propertyTypeName.toLowerCase().includes('shop');
      const defaultPerMarla = isCommercialOrShop ? 105000 : 10500;
      const defaultPerSqFt = isCommercialOrShop ? 467 : 47;

      baseTransferFee = (isCoveredAreaRequired && coveredAreaVal > 0)
        ? coveredAreaVal * defaultPerSqFt
        : propertySizeMarla * defaultPerMarla;

      finalTransferFee = baseTransferFee + sportsFundFee;
      transferFeeExplanation = `Calculated using global default rate (${isCommercialOrShop ? 'Commercial/Shop: 105,000/Marla or 467/Sq.Ft.' : 'Residential: 10,500/Marla or 47/Sq.Ft.'} since official reference is missing).`;
    }

    // --- PRIORITIES & RULES ---

    // Priority 1: Biana Only
    if (transferType === 'Biana Only') {
      const bianaAmt = defaultBiana;
      return {
        isBianaOnly: true,
        rateFound,
        dcValue,
        fbrValue,
        lines: [{ label: 'Biana', amount: bianaAmt, explanation: 'Fixed Biana amount configured by administration.' }],
        grandTotal: bianaAmt
      };
    }

    // Priority 2: Hiba + Seller
    if (transferType === 'Hiba' && whoIsPaying === 'Seller') {
      return {
        isHibaSeller: true,
        rateFound,
        dcValue,
        fbrValue,
        lines: [],
        grandTotal: 0
      };
    }

    // Priority 3: Seller (excluding Hiba + Seller)
    if (whoIsPaying === 'Seller') {
      const taxRate = taxpayer === 'Filer' ? sellerFilerRate : sellerNonFilerRate;
      const sellerTax = fbrValue * (taxRate / 100);
      return {
        isSeller: true,
        rateFound,
        dcValue,
        fbrValue,
        lines: [
          {
            label: `Seller Tax 236C (${taxpayer} @ ${taxRate}%)`,
            amount: sellerTax,
            explanation: `Calculated as FBR Value (Rs. ${Math.round(fbrValue).toLocaleString()}) × ${taxRate}% (${taxpayer} rate for Section 236C capital gain tax on sellers).`
          }
        ],
        grandTotal: sellerTax
      };
    }

    // Purchaser Calculations
    const isHibaPurchaser = transferType === 'Hiba';

    const activeBiana = (bianaIncluded === 'Included' && !isHibaPurchaser) ? defaultBiana : 0;
    const activeVerification = (verification === 'Required' && !isHibaPurchaser) ? verificationFee : 0;

    const isPlotOrFile = ['Plot', 'File'].includes(propertyTypeName);
    const transferFileUnitRate = isPlotOrFile ? transferFilePlotFile : transferFileOther;
    const totalTransferFile = transferFileUnitRate * ownersCount;

    const membershipUnitFee = getMembershipFeeAmount(category, propertySizeMarla);
    const totalMembershipFee = membershipUnitFee * ownersCount;
    const totalMembershipForm = membershipFormFee * ownersCount;

    let agreementAmount = 0;
    if (!isHibaPurchaser) {
      if (agreementType === 'Simple') {
        agreementAmount = agreementSimpleFee;
      } else {
        agreementAmount = (dcValue * 0.001) + 4000;
      }
    }

    const ar17 = dcValue * 0.01;
    const challan63a = (dcValue * 0.01) + mutationFee + plraServiceFee + plraMutationFee;
    const psidFee = stampDutyPayment === 'Online' ? onlinePsidFee : 0;
    const totalStampDuty = ar17 + challan63a + psidFee;

    const tax236kRate = taxpayer === 'Filer' ? purchaserFilerRate : purchaserNonFilerRate;
    const total236k = !isHibaPurchaser ? fbrValue * (tax236kRate / 100) : 0;

    const urgentFeeRateVal = transferType === 'Urgent' ? urgentFeeRate * ownersCount : 0;
    const executiveFeeRateVal = transferType === 'Executive' ? executiveFeeRate * ownersCount : 0;

    const lines = [];

    if (!isHibaPurchaser && activeBiana > 0) {
      lines.push({ label: 'Biana', amount: activeBiana, explanation: 'Initial token/earnest money (Biana) agreed upon or configured.' });
    }
    if (!isHibaPurchaser && activeVerification > 0) {
      lines.push({ label: 'Verification Charges', amount: activeVerification, explanation: 'Property and ownership verification charges.' });
    }
    if (totalTransferFile > 0) {
      lines.push({
        label: `Transfer File (${ownersCount} owner${ownersCount > 1 ? 's' : ''})`,
        amount: totalTransferFile,
        explanation: `Charged per owner: Rs. ${isPlotOrFile ? '7,000' : '8,000'} × ${ownersCount} owner(s).`
      });
    }
    if (!isHibaPurchaser) {
      const effectiveBaseTransferFee = expenseOverrides['Base Transfer Fee'] !== undefined && !isNaN(parseFloat(expenseOverrides['Base Transfer Fee']))
        ? parseFloat(expenseOverrides['Base Transfer Fee'])
        : baseTransferFee;

      const effectiveSportsFund = expenseOverrides['Sports Fund (Once per property)'] !== undefined && !isNaN(parseFloat(expenseOverrides['Sports Fund (Once per property)']))
        ? parseFloat(expenseOverrides['Sports Fund (Once per property)'])
        : sportsFundFee;

      lines.push({
        label: 'Base Transfer Fee',
        amount: effectiveBaseTransferFee,
        explanation: transferFeeExplanation
      });
      lines.push({
        label: 'Sports Fund (Once per property)',
        amount: effectiveSportsFund,
        explanation: 'Mandatory Rs. 10,500 Sports Fund charged once per property.'
      });
    }
    if (totalMembershipFee > 0) {
      lines.push({
        label: `Membership Fee (${ownersCount} owner${ownersCount > 1 ? 's' : ''})`,
        amount: totalMembershipFee,
        explanation: `Society membership fee: Rs. ${Number(membershipUnitFee).toLocaleString()} per owner × ${ownersCount} owner(s) (configured fee rule based on property type & area).`
      });
    }
    if (totalMembershipForm > 0) {
      lines.push({
        label: `Membership Form (${ownersCount} owner${ownersCount > 1 ? 's' : ''})`,
        amount: totalMembershipForm,
        explanation: `Society membership form fee: Rs. 2,100 per owner × ${ownersCount} owner(s).`
      });
    }
    if (transferType === 'Urgent' && urgentFeeRateVal > 0) {
      lines.push({
        label: `Urgent Transfer Fee (${ownersCount} owner${ownersCount > 1 ? 's' : ''})`,
        amount: urgentFeeRateVal,
        explanation: `Urgent processing surcharge: Rs. 70,000 per owner × ${ownersCount} owner(s) (added on top of regular transfer fee).`
      });
    }
    if (transferType === 'Executive' && executiveFeeRateVal > 0) {
      lines.push({
        label: `Executive Transfer Fee (${ownersCount} owner${ownersCount > 1 ? 's' : ''})`,
        amount: executiveFeeRateVal,
        explanation: `Executive processing surcharge: Rs. 80,000 per owner × ${ownersCount} owner(s).`
      });
    }
    if (!isHibaPurchaser && agreementAmount > 0) {
      lines.push({
        label: `Agreement to Sell (${agreementType})`,
        amount: agreementAmount,
        explanation: agreementType === 'Simple' ? 'Fixed simple agreement fee of Rs. 4,000.' : 'Calculated as (DC Value × 0.1%) + Rs. 4,000.'
      });
    }
    if (totalStampDuty > 0) {
      lines.push({
        label: `Stamp Duty (${stampDutyPayment})`,
        amount: totalStampDuty,
        explanation: `Consists of:\n• 1st Challan (AR-17): DC Value × 1% = Rs. ${Math.round(ar17).toLocaleString()} (includes BOR Rs. 100 service charges)\n• 2nd Challan (63A): (DC Value × 1%) + Mutation (Rs. 300) + PLRA Service (Rs. 3,600) + PLRA Mutation (Rs. 200) = Rs. ${Math.round(challan63a).toLocaleString()}\n• Online PSID: Rs. ${psidFee}`
      });
    }
    if (!isHibaPurchaser && total236k > 0) {
      lines.push({
        label: `Advance Tax 236K (${taxpayer} @ ${tax236kRate}%)`,
        amount: total236k,
        explanation: `Calculated as FBR Value (Rs. ${Math.round(fbrValue).toLocaleString()}) × ${tax236kRate}% (${taxpayer} rate for Section 236K purchaser withholding tax).`
      });
    }

    const processedLines = lines
      .filter(l => !deletedLines.includes(l.label))
      .map(l => {
        const effectiveAmount = expenseOverrides[l.label] !== undefined ? parseFloat(expenseOverrides[l.label]) : l.amount;
        return { ...l, amount: isNaN(effectiveAmount) ? l.amount : effectiveAmount };
      });

    const customLines = customExpenses.map(ce => ({
      label: ce.label,
      amount: parseFloat(ce.amount) || 0,
      isCustom: true,
      id: ce.id,
      explanation: 'Custom user-added expense.'
    }));

    const allLines = [...processedLines, ...customLines];
    const grandTotal = allLines.filter(l => !l.isSub).reduce((sum, item) => sum + item.amount, 0);

    return {
      isPurchaser: true,
      rateFound,
      dcValue,
      fbrValue,
      baseTransferFee,
      sportsFundFee,
      finalTransferFee,
      lines: allLines,
      grandTotal
    };
  }, [
    config, selectedPhaseId, selectedBlockId, propertyTypeId, category,
    propertySize, propertySizeUnit, coveredArea, transferType, whoIsPaying,
    numberOfOwners, taxpayer, verification, bianaIncluded, agreementType,
    stampDutyPayment, expenseOverrides, customExpenses, deletedLines
  ]);

  const handleLineOverrideChange = (label, val) => {
    setExpenseOverrides(prev => ({
      ...prev,
      [label]: val
    }));
  };

  const handleCustomExpenseAmountChange = (id, val) => {
    setCustomExpenses(prev => prev.map(ce => ce.id === id ? { ...ce, amount: val } : ce));
  };

  const handleAddCustomExpense = () => {
    if (!newCustomLabel.trim() || !newCustomAmount || parseFloat(newCustomAmount) < 0) {
      toast.error('Please enter a valid expense name and amount');
      return;
    }
    setCustomExpenses(prev => [
      ...prev,
      { id: Date.now(), label: newCustomLabel.trim(), amount: parseFloat(newCustomAmount) }
    ]);
    setNewCustomLabel('');
    setNewCustomAmount('');
    setShowAddCustom(false);
    toast.success('Custom expense added');
  };

  const handleRemoveCustomExpense = (id) => {
    setCustomExpenses(prev => prev.filter(ce => ce.id !== id));
    toast.success('Custom expense removed');
  };

  const handleResetExpenses = () => {
    setExpenseOverrides({});
    setDeletedLines([]);
    setCustomExpenses([]);
    toast.success('All expenses reset to defaults');
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups for printing report');
      return;
    }

    const linesHtml = calculationResult?.lines.map(l => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; ${l.isSub ? 'padding-left: 24px;' : ''}">
          <div style="color: #1e293b; font-weight: 500; font-size: 13px;">${l.label}</div>
          ${l.explanation ? `<div style="color: #64748b; font-size: 10.5px; margin-top: 3px; line-height: 1.3;">${l.explanation}</div>` : ''}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; vertical-align: top; color: #0f172a; font-weight: 600; font-size: 13px;">Rs. ${Math.round(l.amount).toLocaleString()}</td>
      </tr>
    `).join('') || '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Official Transfer Expense Summary - The Zalmi Marketing</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 15mm;
            font-size: 12pt;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #D4AF37;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 22px;
            color: #0f172a;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          .header p {
            margin: 4px 0 0;
            font-size: 11px;
            color: #64748b;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #475569;
            margin-bottom: 15px;
          }
          .card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px 16px;
            margin-bottom: 15px;
          }
          .grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 15px;
          }
          .label {
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 700;
            color: #64748b;
            letter-spacing: 0.5px;
          }
          .value {
            font-size: 15px;
            font-weight: bold;
            color: #0f172a;
            margin-top: 2px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background: #f1f5f9;
            color: #334155;
            font-weight: 600;
            text-align: left;
            padding: 8px 12px;
            font-size: 11px;
            border-bottom: 2px solid #cbd5e1;
            text-transform: uppercase;
          }
          .total-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8fafc;
            border: 2px solid #D4AF37;
            border-radius: 6px;
            padding: 12px 18px;
            margin-top: 15px;
          }
          .total-label {
            font-size: 15px;
            font-weight: bold;
            color: #0f172a;
          }
          .total-amount {
            font-size: 22px;
            font-weight: 900;
            color: #b39030;
          }
          .signatures {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;
            margin-top: 40px;
            text-align: center;
          }
          .sig-line {
            border-top: 1px solid #94a3b8;
            padding-top: 8px;
            font-size: 11px;
            font-weight: 600;
            color: #475569;
          }
          .sig-title {
            font-size: 9px;
            color: #64748b;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>The Zalmi Marketing</h1>
          <p>Real Estate Consultants & Property Valuation Advisors</p>
        </div>

        <div class="meta-row">
          <span><strong>Ref:</strong> ZM-CALC-${Math.floor(100000 + Math.random() * 900000)}</span>
          <span><strong>Date:</strong> ${new Date().toLocaleDateString()}</span>
        </div>

        <div class="card">
          <div style="font-size: 13px; font-weight: bold; color: #1e293b; margin-bottom: 4px;">
            ${selectedCityObj?.name} &bull; ${selectedSocietyObj?.name} &bull; ${selectedPhaseObj?.name} ${selectedBlockObj ? `&bull; ${selectedBlockObj.name}` : ''}
          </div>
          <div style="font-size: 11px; color: #64748b;">
            Transfer Type: <strong>${transferType}</strong> | Payer: <strong>${whoIsPaying}</strong> | Status: <strong>${taxpayer}</strong>
          </div>
        </div>

        <div class="grid-3">
          <div class="card" style="margin-bottom: 0;">
            <div class="label">Property Details</div>
            <div class="value" style="font-size: 13px;">${category} &bull; ${selectedPropertyTypeObj?.label || propertyTypeName}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Size: ${propertySize} ${propertySizeUnit}</div>
          </div>
          <div class="card" style="margin-bottom: 0;">
            <div class="label">DC Valuation</div>
            <div class="value">Rs. ${Math.round(calculationResult?.dcValue || 0).toLocaleString()}</div>
          </div>
          <div class="card" style="margin-bottom: 0;">
            <div class="label">FBR Valuation</div>
            <div class="value" style="color: #b39030;">Rs. ${Math.round(calculationResult?.fbrValue || 0).toLocaleString()}</div>
          </div>
        </div>

        <div style="font-size: 13px; font-weight: bold; color: #1e293b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
          Applicable Expenses Breakdown
        </div>
        <table>
          <thead>
            <tr>
              <th>Expense Item</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${linesHtml}
          </tbody>
        </table>

        <div class="total-box">
          <div>
            <div class="total-label">Grand Total</div>
            <div style="font-size: 10px; color: #64748b;">Includes all selected government taxes and society fees</div>
          </div>
          <div class="total-amount">
            Rs. ${Math.round(calculationResult?.grandTotal || 0).toLocaleString()}
          </div>
        </div>

        <div style="text-align: center; font-size: 10px; color: #64748b; font-style: italic; margin-top: 15px;">
          Note: All calculations are based on configured rates and there can be human error. Please verify with official society/government offices.
        </div>

        <div class="signatures">
          <div>
            <div class="sig-line">Prepared By</div>
            <div class="sig-title">The Zalmi Marketing</div>
          </div>
          <div>
            <div class="sig-line">Checked / Verified</div>
            <div class="sig-title">Accounts Department</div>
          </div>
          <div>
            <div class="sig-line">Client Signature</div>
            <div class="sig-title">Acknowledgement</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleDownloadDoc = () => {
    const linesHtml = calculationResult?.lines.map(l => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; ${l.isSub ? 'padding-left: 24px;' : ''}">
          <div style="color: #1e293b; font-weight: 500; font-size: 13px;">${l.label}</div>
          ${l.explanation ? `<div style="color: #64748b; font-size: 10.5px; margin-top: 3px; line-height: 1.3;">${l.explanation}</div>` : ''}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; vertical-align: top; color: #0f172a; font-weight: 600; font-size: 13px;">Rs. ${Math.round(l.amount).toLocaleString()}</td>
      </tr>
    `).join('') || '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Official Transfer Expense Summary - The Zalmi Marketing</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 20px;
            font-size: 12pt;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #D4AF37;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 22px;
            color: #0f172a;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          .header p {
            margin: 4px 0 0;
            font-size: 11px;
            color: #64748b;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #475569;
            margin-bottom: 15px;
          }
          .card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px 16px;
            margin-bottom: 15px;
          }
          .grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 15px;
          }
          .label {
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 700;
            color: #64748b;
            letter-spacing: 0.5px;
          }
          .value {
            font-size: 15px;
            font-weight: bold;
            color: #0f172a;
            margin-top: 2px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background: #f1f5f9;
            color: #334155;
            font-weight: 600;
            text-align: left;
            padding: 8px 12px;
            font-size: 11px;
            border-bottom: 2px solid #cbd5e1;
            text-transform: uppercase;
          }
          .total-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8fafc;
            border: 2px solid #D4AF37;
            border-radius: 6px;
            padding: 12px 18px;
            margin-top: 15px;
          }
          .total-label {
            font-size: 15px;
            font-weight: bold;
            color: #0f172a;
          }
          .total-amount {
            font-size: 22px;
            font-weight: 900;
            color: #b39030;
          }
          .signatures {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;
            margin-top: 40px;
            text-align: center;
          }
          .sig-line {
            border-top: 1px solid #94a3b8;
            padding-top: 8px;
            font-size: 11px;
            font-weight: 600;
            color: #475569;
          }
          .sig-title {
            font-size: 9px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>The Zalmi Marketing</h1>
          <p>Real Estate Consultants & Property Valuation Advisors</p>
        </div>

        <div class="meta-row">
          <span><strong>Ref:</strong> ZM-CALC-${Math.floor(100000 + Math.random() * 900000)}</span>
          <span><strong>Date:</strong> ${new Date().toLocaleDateString()}</span>
        </div>

        <div class="card">
          <div style="font-size: 13px; font-weight: bold; color: #1e293b; margin-bottom: 4px;">
            ${selectedCityObj?.name} &bull; ${selectedSocietyObj?.name} &bull; ${selectedPhaseObj?.name} ${selectedBlockObj ? `&bull; ${selectedBlockObj.name}` : ''}
          </div>
          <div style="font-size: 11px; color: #64748b;">
            Transfer Type: <strong>${transferType}</strong> | Payer: <strong>${whoIsPaying}</strong> | Status: <strong>${taxpayer}</strong>
          </div>
        </div>

        <div class="grid-3">
          <div class="card" style="margin-bottom: 0;">
            <div class="label">Property Details</div>
            <div class="value" style="font-size: 13px;">${category} &bull; ${selectedPropertyTypeObj?.label || propertyTypeName}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Size: ${propertySize} ${propertySizeUnit}</div>
          </div>
          <div class="card" style="margin-bottom: 0;">
            <div class="label">DC Valuation</div>
            <div class="value">Rs. ${Math.round(calculationResult?.dcValue || 0).toLocaleString()}</div>
          </div>
          <div class="card" style="margin-bottom: 0;">
            <div class="label">FBR Valuation</div>
            <div class="value" style="color: #b39030;">Rs. ${Math.round(calculationResult?.fbrValue || 0).toLocaleString()}</div>
          </div>
        </div>

        <div style="font-size: 13px; font-weight: bold; color: #1e293b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
          Applicable Expenses Breakdown
        </div>
        <table>
          <thead>
            <tr>
              <th>Expense Item</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${linesHtml}
          </tbody>
        </table>

        <div class="total-box">
          <div>
            <div class="total-label">Grand Total</div>
            <div style="font-size: 10px; color: #64748b;">Includes all selected government taxes and society fees</div>
          </div>
          <div class="total-amount">
            Rs. ${Math.round(calculationResult?.grandTotal || 0).toLocaleString()}
          </div>
        </div>

        <div style="text-align: center; font-size: 10px; color: #64748b; font-style: italic; margin-top: 15px;">
          Note: All calculations are based on configured rates and there can be human error. Please verify with official society/government offices.
        </div>

        <div class="signatures">
          <div>
            <div class="sig-line">Prepared By</div>
            <div class="sig-title">The Zalmi Marketing</div>
          </div>
          <div>
            <div class="sig-line">Checked / Verified</div>
            <div class="sig-title">Accounts Department</div>
          </div>
          <div>
            <div class="sig-line">Client Signature</div>
            <div class="sig-title">Acknowledgement</div>
          </div>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Transfer_Summary_${selectedSocietyObj?.name || 'Property'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Document downloaded successfully (.doc)');
  };

  const handleDownloadImage = (format = 'png') => {
    const lineCount = calculationResult?.lines?.length || 0;
    const dynamicHeight = Math.max(1100, 480 + (lineCount * 55) + 180);
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = dynamicHeight;
    const ctx = canvas.getContext('2d');
    
    // Background (White clean paper style)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 760, dynamicHeight - 40);

    // Header Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('THE ZALMI MARKETING', 40, 65);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.fillText('Real Estate Consultants & Property Valuation Advisors', 40, 88);

    // Gold Divider Line
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(40, 105);
    ctx.lineTo(760, 105);
    ctx.stroke();

    // Meta row
    ctx.fillStyle = '#475569';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Ref: ZM-CALC-${Math.floor(100000 + Math.random() * 900000)}`, 40, 135);
    ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, 620, 135);

    // Location & Society Card Box
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(40, 150, 720, 65);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 150, 720, 65);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`${selectedCityObj?.name} • ${selectedSocietyObj?.name} • ${selectedPhaseObj?.name} ${selectedBlockObj ? `• ${selectedBlockObj.name}` : ''}`, 55, 178);
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Transfer Type: ${transferType} | Payer: ${whoIsPaying} | Status: ${taxpayer}`, 55, 198);

    // Valuations Boxes
    const boxW = 230;
    const boxH = 70;
    
    // Property Details Box
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(40, 230, boxW, boxH);
    ctx.strokeRect(40, 230, boxW, boxH);
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('PROPERTY DETAILS', 55, 250);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`${category} • ${selectedPropertyTypeObj?.label || propertyTypeName}`, 55, 270);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`Size: ${propertySize} ${propertySizeUnit}`, 55, 288);

    // DC Valuation Box
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(285, 230, boxW, boxH);
    ctx.strokeRect(285, 230, boxW, boxH);
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('DC VALUATION', 300, 250);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`Rs. ${Math.round(calculationResult?.dcValue || 0).toLocaleString()}`, 300, 280);

    // FBR Valuation Box
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(530, 230, boxW, boxH);
    ctx.strokeRect(530, 230, boxW, boxH);
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('FBR VALUATION', 545, 250);
    ctx.fillStyle = '#b39030';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`Rs. ${Math.round(calculationResult?.fbrValue || 0).toLocaleString()}`, 545, 280);

    // Expenses Header
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('APPLICABLE EXPENSES BREAKDOWN', 40, 335);

    // Table Header
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(40, 350, 720, 30);
    ctx.strokeRect(40, 350, 720, 30);
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('EXPENSE ITEM', 55, 370);
    ctx.textAlign = 'right';
    ctx.fillText('AMOUNT', 745, 370);
    ctx.textAlign = 'left';

    let y = 405;
    ctx.font = '13px sans-serif';
    calculationResult?.lines.forEach(l => {
      ctx.fillStyle = l.isSub ? '#64748b' : '#1e293b';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(l.label, l.isSub ? 60 : 45, y);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`Rs. ${Math.round(l.amount).toLocaleString()}`, 745, y);
      ctx.textAlign = 'left';

      if (l.explanation) {
        y += 16;
        ctx.fillStyle = '#64748b';
        ctx.font = '10.5px sans-serif';
        ctx.fillText(l.explanation, l.isSub ? 60 : 45, y);
      }

      y += 28;
    });

    // Grand Total Box
    y += 10;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(40, y, 720, 60);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, y, 720, 60);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('Grand Total', 60, y + 36);
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.fillText('Includes all selected government taxes and society fees', 60, y + 52);

    ctx.fillStyle = '#b39030';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Rs. ${Math.round(calculationResult?.grandTotal || 0).toLocaleString()}`, 740, y + 38);
    ctx.textAlign = 'left';

    // Clarification note
    y += 75;
    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Note: All calculations are based on configured rates and there can be human error. Please verify with official authorities.', 400, y);
    ctx.textAlign = 'left';

    // Signatures Section
    y += 35;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;

    // Prepared By
    ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(260, y); ctx.stroke();
    ctx.fillStyle = '#1e293b'; ctx.font = 'bold 11px sans-serif'; ctx.fillText('Prepared By', 60, y + 16);
    ctx.fillStyle = '#64748b'; ctx.font = '10px sans-serif'; ctx.fillText('The Zalmi Marketing', 60, y + 30);

    // Checked By
    ctx.beginPath(); ctx.moveTo(300, y); ctx.lineTo(500, y); ctx.stroke();
    ctx.fillStyle = '#1e293b'; ctx.font = 'bold 11px sans-serif'; ctx.fillText('Checked / Verified', 300, y + 16);
    ctx.fillStyle = '#64748b'; ctx.font = '10px sans-serif'; ctx.fillText('Accounts Department', 300, y + 30);

    // Client Signature
    ctx.beginPath(); ctx.moveTo(540, y); ctx.lineTo(740, y); ctx.stroke();
    ctx.fillStyle = '#1e293b'; ctx.font = 'bold 11px sans-serif'; ctx.fillText('Client Signature', 540, y + 16);
    ctx.fillStyle = '#64748b'; ctx.font = '10px sans-serif'; ctx.fillText('Acknowledgement', 540, y + 30);

    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const dataUrl = canvas.toDataURL(mimeType, 1.0);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `Transfer_Summary.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Summary saved as ${format.toUpperCase()}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium">{content.hero.loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader>
            <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-2">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <CardTitle className="text-xl">{content.hero.errorTitle}</CardTitle>
            <CardDescription>{error || 'Unable to load calculator configuration.'}</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => window.location.reload()} className="bg-[#D4AF37] hover:bg-[#b39030] text-black font-semibold">
              <RefreshCw className="w-4 h-4 mr-2" /> {content.hero.retryButton}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      {/* Hero Section with Dark Background (matching Properties, Files, Maps) */}
      <section className="relative pt-24 pb-12 sm:pt-40 sm:pb-24 bg-slate-950 dark:bg-slate-950 border-b border-[#F5A623]/20 dark:border-[#D4AF37]/20 text-white overflow-hidden print:hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-35 scale-105 transform hover:scale-100 transition-transform duration-1000" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=2000&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#F5A623]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <Badge variant="outline" className="px-4 py-1.5 text-xs font-medium text-white border-[#F5A623]/40 dark:border-[#D4AF37]/40 bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 rounded-full">
            <Calculator className="w-3.5 h-3.5 text-[#F5A623] dark:text-[#D4AF37] mr-2 inline" /> {content.hero.badge}
          </Badge>
          <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl font-display">
            {content.hero.heading}
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300">
            {content.hero.subheading}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* Wizard Steps Indicator */}
        {!showResults && (
          <div className="grid grid-cols-3 gap-1.5 mb-6 sm:mb-8 max-w-2xl mx-auto print:hidden">
            {[
              { num: 1, title: 'Location & Who', icon: MapPin },
              { num: 2, title: 'Property', icon: Building2 },
              { num: 3, title: 'Transfer Options', icon: Calculator },
            ].map((s) => {
              const isActive = step === s.num;
              const isCompleted = step > s.num;
              return (
                <div
                  key={s.num}
                  onClick={() => { if (s.num < step) setStep(s.num); }}
                  className={`flex items-center gap-2 p-2 sm:gap-3 sm:p-3 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-foreground shadow-sm'
                      : isCompleted
                      ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
                      : 'border-border/50 bg-card/50 text-muted-foreground'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                    isActive ? 'bg-[#D4AF37] text-black' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs text-muted-foreground">Step {s.num}</div>
                    <div className="text-sm font-semibold">{s.title}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Main Content: Wizard or Results Breakdown */}
        {!showResults ? (
          <Card className="border-border/60 bg-card/80 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden print:shadow-none print:border-none">
            
            {/* STEP 1: LOCATION & WHO IS PAYING */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="p-4 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#D4AF37]" /> Step 1: Location & Who is Paying
                  </h2>
                  <p className="text-sm text-muted-foreground">Choose the city, society, phase, block, and transaction payer.</p>
                </div>

                <div className="space-y-4">
                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                    <Select value={selectedCityId} onValueChange={handleCityChange}>
                      <SelectTrigger id="city" className="w-full">
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent>
                        {config.cities.map(c => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Society */}
                  <div className="space-y-2">
                    <Label htmlFor="society">Society / Project <span className="text-red-500">*</span></Label>
                    <Select value={selectedSocietyId} onValueChange={handleSocietyChange} disabled={!selectedCityId}>
                      <SelectTrigger id="society" className="w-full">
                        <SelectValue placeholder={selectedCityId ? "Select Society" : "Select City first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSocieties.map(s => (
                          <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Phase */}
                  <div className="space-y-2">
                    <Label htmlFor="phase">Calculator Phase <span className="text-red-500">*</span></Label>
                    <Select value={selectedPhaseId} onValueChange={handlePhaseChange} disabled={!selectedSocietyId}>
                      <SelectTrigger id="phase" className="w-full">
                        <SelectValue placeholder={selectedSocietyId ? "Select Phase" : "Select Society first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePhases.map(p => (
                          <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Block (conditional) */}
                  <div className="space-y-2">
                    <Label htmlFor="block">
                      Block {hasBlocksForSelectedPhase ? <span className="text-red-500">*</span> : <span className="text-muted-foreground text-xs">(Optional / Phase-level)</span>}
                    </Label>
                    <Select value={selectedBlockId} onValueChange={setSelectedBlockId} disabled={!selectedPhaseId || !hasBlocksForSelectedPhase}>
                      <SelectTrigger id="block" className="w-full">
                        <SelectValue placeholder={!selectedPhaseId ? "Select Phase first" : (hasBlocksForSelectedPhase ? "Select Block" : "No blocks in this phase")} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBlocks.map(b => (
                          <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Who is Paying */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <Label>Who is Paying <span className="text-red-500">*</span></Label>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {['Purchaser', 'Seller'].map((who) => (
                        <Button
                          key={who}
                          type="button"
                          variant={whoIsPaying === who ? 'default' : 'outline'}
                          onClick={() => setWhoIsPaying(who)}
                          className={`rounded-xl font-semibold h-11 ${
                            whoIsPaying === who ? 'bg-[#D4AF37] text-black hover:bg-[#b39030]' : ''
                          }`}
                        >
                          {who}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => {
                      if (!selectedCityId || !selectedSocietyId || !selectedPhaseId || (hasBlocksForSelectedPhase && !selectedBlockId)) {
                        toast.error('Please complete all required location fields');
                        return;
                      }
                      setStep(2);
                    }}
                    className="bg-[#D4AF37] hover:bg-[#b39030] text-black font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    Next: Property Details <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: PROPERTY */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="p-4 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#D4AF37]" /> Step 2: Property Details
                  </h2>
                  <p className="text-sm text-muted-foreground">Select category, property type, size, and covered area if applicable.</p>
                </div>

                <div className="space-y-4">
                  {/* Category */}
                  <div className="space-y-2">
                    <Label>Category <span className="text-red-500">*</span></Label>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                      {['Residential', 'Commercial', 'Sector Shop'].map((cat) => (
                        <Button
                          key={cat}
                          type="button"
                          variant={category === cat ? 'default' : 'outline'}
                          onClick={() => handleCategoryChange(cat)}
                          className={`rounded-xl font-semibold text-xs sm:text-sm h-11 ${
                            category === cat ? 'bg-[#D4AF37] text-black hover:bg-[#b39030]' : ''
                          }`}
                        >
                          {cat}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Property Type */}
                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type <span className="text-red-500">*</span></Label>
                    <Select value={propertyTypeId} onValueChange={setPropertyTypeId}>
                      <SelectTrigger id="propertyType" className="w-full">
                        <SelectValue placeholder="Select Property Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePropertyTypes.map(pt => (
                          <SelectItem key={pt.id} value={String(pt.id)}>{pt.label || pt.property_type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Property Size */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-7 space-y-2">
                      <Label htmlFor="propSize">Property Size <span className="text-red-500">*</span></Label>
                      <Input
                        id="propSize"
                        type="number"
                        step="any"
                        min="0.1"
                        value={propertySize}
                        onChange={(e) => setPropertySize(e.target.value)}
                        placeholder="e.g. 5 or 10"
                      />
                    </div>
                    <div className="sm:col-span-5 space-y-2">
                      <Label htmlFor="propUnit">Unit</Label>
                      <Select value={propertySizeUnit} onValueChange={setPropertySizeUnit}>
                        <SelectTrigger id="propUnit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Marla">Marla</SelectItem>
                          <SelectItem value="Kanal">Kanal</SelectItem>
                          <SelectItem value="Sq. Yards">Sq. Yards</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Quick Common Sizes */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-xs text-muted-foreground self-center mr-1">Common:</span>
                    {['3 Marla', '5 Marla', '10 Marla', '1 Kanal', '2 Kanal'].map((sz) => {
                      const parts = sz.split(' ');
                      return (
                        <Button
                          key={sz}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPropertySize(parts[0]);
                            setPropertySizeUnit(parts[1] === 'Kanal' ? 'Kanal' : 'Marla');
                          }}
                          className="text-xs h-7 rounded-lg"
                        >
                          {sz}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Covered Area (Conditional) */}
                  {isCoveredAreaRequired && (
                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <Label htmlFor="coveredArea">
                        Covered Area (Sq. Ft.) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="coveredArea"
                        type="number"
                        step="any"
                        min="1"
                        value={coveredArea}
                        onChange={(e) => setCoveredArea(e.target.value)}
                        placeholder="e.g. 2250"
                      />
                      <p className="text-xs text-amber-500 font-medium">
                        Note: Covered Area is required for {propertyTypeName} valuation (DC/FBR per sq. ft.).
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button
                    onClick={() => {
                      if (!propertyTypeId) {
                        toast.error('Please select a property type');
                        return;
                      }
                      if (!propertySize || parseFloat(propertySize) <= 0) {
                        toast.error('Please enter a valid property size');
                        return;
                      }
                      if (isCoveredAreaRequired && (!coveredArea || parseFloat(coveredArea) <= 0)) {
                        toast.error(`Covered Area is required for ${propertyTypeName}`);
                        return;
                      }
                      setStep(3);
                    }}
                    className="bg-[#D4AF37] hover:bg-[#b39030] text-black font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    Next: Transfer Options <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: TRANSFER OPTIONS & CALCULATE */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="p-4 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-[#D4AF37]" /> Step 3: Transfer & Tax Options
                  </h2>
                  <p className="text-sm text-muted-foreground">Configure transfer type, taxpayer status, and payment method.</p>
                </div>

                <div className="space-y-4">
                  {/* Transfer Type */}
                  <div className="space-y-2">
                    <Label htmlFor="transferType">Transfer Type</Label>
                    <Select value={transferType} onValueChange={setTransferType}>
                      <SelectTrigger id="transferType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Regular">Regular</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                        <SelectItem value="Executive">Executive</SelectItem>
                        <SelectItem value="Hiba">Hiba (Gift)</SelectItem>
                        <SelectItem value="Biana Only">Biana Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Number of Owners */}
                  {transferType !== 'Biana Only' && whoIsPaying !== 'Seller' && (
                    <div className="space-y-2">
                      <Label htmlFor="owners">Number of Owners</Label>
                      <Input
                        id="owners"
                        type="number"
                        min="1"
                        max="20"
                        value={numberOfOwners}
                        onChange={(e) => setNumberOfOwners(e.target.value)}
                      />
                    </div>
                  )}

                  {/* Taxpayer Status */}
                  {transferType !== 'Biana Only' && !(transferType === 'Hiba' && whoIsPaying === 'Seller') && (
                    <div className="space-y-2">
                      <Label>Taxpayer Status (FBR)</Label>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {['Filer', 'Non-Filer'].map((tp) => (
                          <Button
                            key={tp}
                            type="button"
                            variant={taxpayer === tp ? 'default' : 'outline'}
                            onClick={() => setTaxpayer(tp)}
                            className={`rounded-xl font-semibold h-10 ${
                              taxpayer === tp ? 'bg-[#D4AF37] text-black hover:bg-[#b39030]' : ''
                            }`}
                          >
                            {tp}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Options (Purchaser regular/urgent/executive) */}
                  {transferType !== 'Biana Only' && whoIsPaying === 'Purchaser' && transferType !== 'Hiba' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
                      <div className="space-y-2">
                        <Label>Verification</Label>
                        <Select value={verification} onValueChange={setVerification}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Required">Required (Rs. 5,250)</SelectItem>
                            <SelectItem value="Not Required">Not Required (Rs. 0)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Biana</Label>
                        <Select value={bianaIncluded} onValueChange={setBianaIncluded}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Included">Included</SelectItem>
                            <SelectItem value="Not Included">Not Included</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Agreement to Sell</Label>
                        <Select value={agreementType} onValueChange={setAgreementType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Simple">Simple (Rs. 4,000)</SelectItem>
                            <SelectItem value="DC Value">DC Value Based</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Stamp Duty Payment</Label>
                        <Select value={stampDutyPayment} onValueChange={setStampDutyPayment}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Online">Online PSID (+Rs. 15)</SelectItem>
                            <SelectItem value="Bank">Bank Challan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Custom Rate Overrides (if rate not known/configured) */}
                  <div className="space-y-3 pt-4 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Custom DC & FBR Rate Override (Optional)
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      If official rates for this phase/block are not configured or you want to use custom rates for your calculation:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="customDc" className="text-xs">Custom DC Rate ({isCoveredAreaRequired ? 'Per Sq.Ft.' : 'Per Marla'}) (Rs.)</Label>
                        <Input
                          id="customDc"
                          type="number"
                          placeholder="e.g. 500000"
                          value={customDcRate}
                          onChange={(e) => setCustomDcRate(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="customFbr" className="text-xs">Custom FBR Rate ({isCoveredAreaRequired ? 'Per Sq.Ft.' : 'Per Marla'}) (Rs.)</Label>
                        <Input
                          id="customFbr"
                          type="number"
                          placeholder="e.g. 400000"
                          value={customFbrRate}
                          onChange={(e) => setCustomFbrRate(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-border/60">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Property
                  </Button>
                  <Button
                    onClick={() => {
                      setShowResults(true);
                      toast.success('Calculation completed successfully!');
                    }}
                    className="bg-[#D4AF37] hover:bg-[#b39030] text-black font-bold px-8 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg text-base"
                  >
                    <Calculator className="w-5 h-5" /> Calculate Transfer Expenses
                  </Button>
                </div>
              </motion.div>
            )}
          </Card>
        ) : (
          /* RESULTS & EXPENSE BREAKDOWN VIEW */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 sm:gap-3 print:hidden">
              <Button
                variant="outline"
                onClick={() => setShowResults(false)}
                className="rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Modify Calculator Inputs
              </Button>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={handlePrintReport}
                  className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print / PDF
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-[#D4AF37] hover:bg-[#b39030] text-black font-bold rounded-xl flex items-center gap-2 cursor-pointer">
                      <Download className="w-4 h-4" /> Save As...
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-950 border-slate-800 text-white rounded-xl p-1.5 shadow-2xl">
                    <DropdownMenuItem onClick={handleDownloadDoc} className="group hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] rounded-lg cursor-pointer flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-[#D4AF37] dark:group-hover:text-white" /> Word Document (.doc)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownloadImage('png')} className="group hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] rounded-lg cursor-pointer flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#D4AF37] dark:group-hover:text-white" /> PNG Image (.png)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownloadImage('jpg')} className="group hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] rounded-lg cursor-pointer flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#D4AF37] dark:group-hover:text-white" /> JPEG Image (.jpg)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Card className="printable-calculator-summary border-border/80 bg-card text-card-foreground shadow-2xl rounded-3xl overflow-hidden border-[#D4AF37]/30 print:bg-white print:text-black print:border-slate-300">
              {/* Print-only Official Letterhead Header */}
              <div className="hidden print:block mb-4 pb-4 border-b-2 border-slate-300 text-center">
                <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">The Zalmi Marketing</h1>
                <p className="text-xs text-slate-600 mt-0.5">Real Estate Consultants & Property Valuation Advisors</p>
                <div className="flex justify-between items-center text-[11px] text-slate-600 mt-2 px-2">
                  <span>Ref: ZM-CALC-{Math.floor(100000 + Math.random() * 900000)}</span>
                  <span>Date: {new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#D4AF37]/20 via-muted/50 to-card p-4 sm:p-6 border-b border-[#D4AF37]/20 print:bg-slate-100 print:text-black">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <div>
                    <h3 className="text-xl font-display font-bold text-[#D4AF37] print:text-slate-900">Official Transfer Expense Summary</h3>
                    <p className="text-xs text-muted-foreground mt-1 print:text-slate-600">
                      {selectedCityObj?.name} • {selectedSocietyObj?.name} • {selectedPhaseObj?.name} {selectedBlockObj ? `• ${selectedBlockObj.name}` : ''}
                    </p>
                  </div>
                  <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40 print:bg-slate-200 print:text-slate-800">
                    {transferType} / {whoIsPaying}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4 sm:p-6 space-y-6">
                {/* Property Meta & Valuations */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-muted/40 border border-border print:bg-slate-50 print:border-slate-200 min-w-0">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold print:text-slate-600">Property Details</span>
                    <div className="text-sm font-semibold text-foreground mt-0.5 print:text-slate-900">
                      {category} • {selectedPropertyTypeObj?.label || propertyTypeName}
                    </div>
                    <div className="text-xs text-muted-foreground print:text-slate-600">
                      Size: {propertySize} {propertySizeUnit} {coveredArea ? `(Covered: ${coveredArea} Sq.Ft.)` : ''}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold print:text-slate-600">DC Valuation</span>
                    <div className="text-lg font-sans font-bold tabular-nums text-foreground mt-0.5 print:text-slate-900">
                      Rs. {Math.round(calculationResult?.dcValue || 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold print:text-slate-600">FBR Valuation</span>
                    <div className="text-lg font-sans font-bold tabular-nums text-[#D4AF37] mt-0.5 print:text-amber-700">
                      Rs. {Math.round(calculationResult?.fbrValue || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {!calculationResult?.rateFound && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2 print:hidden">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Official DC/FBR rates are not configured for this Phase/Property Type. Calculation is proceeding with valuation = 0. Please add custom DC & FBR rates in Step 3 for precise valuation and taxes.</span>
                  </div>
                )}

                {/* Expense Lines */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between print:hidden">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Applicable Expenses Breakdown</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddCustom(!showAddCustom)}
                      className="text-xs text-[#D4AF37] hover:text-[#b39030] h-7 px-2 cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Expense
                    </Button>
                  </div>

                  {/* Add Custom Expense Inline Form */}
                  {showAddCustom && (
                    <div className="p-3 rounded-xl bg-card border border-[#D4AF37]/30 space-y-3 animate-in fade-in-50 print:hidden shadow-sm">
                      <div className="text-xs font-medium text-[#D4AF37]">Add Custom Expense (Client-Side)</div>
                      <div className="space-y-2">
                        <Input
                          placeholder="Expense Name (e.g. Legal Fee)"
                          value={newCustomLabel}
                          onChange={(e) => setNewCustomLabel(e.target.value)}
                          className="h-8 text-xs bg-background text-foreground"
                        />
                        <Input
                          type="number"
                          placeholder="Amount (Rs.)"
                          value={newCustomAmount}
                          onChange={(e) => setNewCustomAmount(e.target.value)}
                          className="h-8 text-xs bg-background text-foreground"
                        />
                        <div className="flex justify-end gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowAddCustom(false)}
                            className="h-7 text-xs text-muted-foreground"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleAddCustomExpense}
                            className="h-7 text-xs bg-[#D4AF37] text-black hover:bg-[#b39030] font-bold"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {calculationResult?.lines.length === 0 && customExpenses.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground text-sm italic print:text-slate-600">
                      {transferType === 'Hiba' && whoIsPaying === 'Seller'
                        ? 'Hiba + Seller transfer incurs zero fees/taxes.'
                        : 'No expenses applicable for this selection.'}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {(deletedLines.length > 0 || Object.keys(expenseOverrides).length > 0 || customExpenses.length > 0) && (
                        <div className="flex justify-end pb-1 print:hidden">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetExpenses}
                            className="text-xs text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 h-6 px-2 cursor-pointer"
                          >
                            Reset / Restore All Default Expenses
                          </Button>
                        </div>
                      )}
                      {calculationResult?.lines.map((line, idx) => (
                        <div key={idx} className={`flex flex-col sm:flex-row sm:items-center justify-between text-sm py-2 border-b border-border/60 print:border-slate-200 gap-1 sm:gap-0 ${line.isSub ? 'pl-4 text-xs text-muted-foreground print:text-slate-600' : ''}`}>
                          <span className="flex items-center gap-2">
                            <span>{line.label}</span>
                            {line.explanation && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="text-muted-foreground hover:text-[#D4AF37] transition-colors cursor-pointer print:hidden" aria-label="Explanation">
                                    <Info className="w-3.5 h-3.5" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 bg-popover border-border text-popover-foreground text-xs p-3 rounded-xl shadow-xl">
                                  <p className="font-semibold text-[#D4AF37] mb-1">Calculation Rule</p>
                                  <p className="whitespace-pre-line text-muted-foreground leading-relaxed">{line.explanation}</p>
                                </PopoverContent>
                              </Popover>
                            )}
                          </span>
                          <div className="flex items-center gap-2">
                            {line.isSub ? (
                              <div className="flex items-center gap-2">
                                <span className="font-sans font-semibold tabular-nums text-muted-foreground print:text-slate-700">
                                  Rs. {Math.round(line.amount).toLocaleString()}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setDeletedLines(prev => [...prev, line.label]);
                                    toast.success(`Removed "${line.label}" from breakdown`);
                                  }}
                                  className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-500/10 print:hidden"
                                  title="Delete expense"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-muted-foreground print:text-slate-600">Rs.</span>
                                <Input
                                  type="number"
                                  className="w-24 sm:w-32 h-8 text-xs bg-background text-right font-sans font-medium tabular-nums text-foreground border-input print:bg-white print:text-black print:border-slate-300 print:shadow-none"
                                  value={
                                    line.isCustom
                                      ? line.amount
                                      : (expenseOverrides[line.label] !== undefined ? expenseOverrides[line.label] : Math.round(line.amount))
                                  }
                                  onChange={(e) => {
                                    if (line.isCustom) {
                                      handleCustomExpenseAmountChange(line.id, e.target.value);
                                    } else {
                                      handleLineOverrideChange(line.label, e.target.value);
                                    }
                                  }}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    if (line.isCustom) {
                                      handleRemoveCustomExpense(line.id);
                                    } else {
                                      setDeletedLines(prev => [...prev, line.label]);
                                      toast.success(`Removed "${line.label}" from breakdown`);
                                    }
                                  }}
                                  className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-500/10 print:hidden"
                                  title="Delete expense"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator className="bg-border print:bg-slate-300" />

                {/* Grand Total */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-1 sm:gap-0">
                  <div>
                    <div className="text-sm font-bold text-muted-foreground print:text-slate-800">Grand Total</div>
                    <div className="text-xs text-muted-foreground print:text-slate-600">Includes all selected fees & taxes</div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-sans font-bold tabular-nums text-[#D4AF37] print:text-slate-900">
                    Rs. {Math.round(calculationResult?.grandTotal || 0).toLocaleString()}
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <p className="text-[11px] text-muted-foreground italic print:text-slate-500">
                    Note: All calculations are based on configured rates and there can be human error. Please verify with official society/government offices.
                  </p>
                </div>

                {/* Print-only Signatures */}
                <div className="hidden print:grid grid-cols-3 gap-8 pt-10 mt-8 border-t border-slate-300 text-xs text-slate-700">
                  <div className="text-center">
                    <div className="h-10 border-b border-slate-400 mb-2"></div>
                    <p className="font-semibold">Prepared By</p>
                    <p className="text-[10px] text-slate-500">The Zalmi Marketing</p>
                  </div>
                  <div className="text-center">
                    <div className="h-10 border-b border-slate-400 mb-2"></div>
                    <p className="font-semibold">Checked / Verified</p>
                    <p className="text-[10px] text-slate-500">Accounts Department</p>
                  </div>
                  <div className="text-center">
                    <div className="h-10 border-b border-slate-400 mb-2"></div>
                    <p className="font-semibold">Client Signature</p>
                    <p className="text-[10px] text-slate-500">Acknowledgement</p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-muted/40 p-4 sm:p-6 border-t border-border flex flex-col gap-3 print:bg-slate-100 print:border-slate-300">
                <Button
                  onClick={handlePrintReport}
                  className="w-full bg-[#D4AF37] hover:bg-[#b39030] text-black font-bold h-12 rounded-xl text-base shadow-lg cursor-pointer print:hidden"
                >
                  <Printer className="w-5 h-5 mr-2" /> Print / Save as PDF Summary
                </Button>
                <p className="text-center text-xs text-muted-foreground print:text-slate-600">
                  Official rates applied according to government and society guidelines. Generated by The Zalmi Marketing.
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        )}

      </div>
    </div>
  );
}
