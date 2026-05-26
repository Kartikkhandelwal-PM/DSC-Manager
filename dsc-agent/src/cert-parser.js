'use strict';

const forge = require('node-forge');

// OIDs for Indian DSC certificate policies
const DSC_CLASS_OIDS = {
  '2.16.356.100.2.1': 'Class 1',
  '2.16.356.100.2.2': 'Class 2',
  '2.16.356.100.2.3': 'Class 3',
  '2.16.356.100.2.5': 'DGFT',
  '2.16.356.100.2.6': 'Document Signer',
};

/**
 * Parse an X.509 certificate from raw DER bytes (Buffer or Uint8Array).
 * Returns a plain object matching the DSC data schema.
 */
function parseCertDER(derBytes) {
  const buf = Buffer.isBuffer(derBytes) ? derBytes : Buffer.from(derBytes);
  const binaryStr = buf.toString('binary');

  const asn1 = forge.asn1.fromDer(binaryStr);
  const cert  = forge.pki.certificateFromAsn1(asn1);

  // ── Subject fields ──
  const sub = cert.subject;
  const get = (field) => {
    const attr = sub.getField(field);
    return attr ? attr.value : '';
  };

  const holderName = get('CN')  || get('commonName')        || '';
  const org        = get('O')   || get('organizationName')  || '';
  const orgUnit    = get('OU')  || get('organizationalUnitName') || '';
  const city       = get('L')   || get('localityName')      || '';
  const state      = get('ST')  || get('stateOrProvinceName') || '';
  const country    = get('C')   || get('countryName')       || '';

  // emailAddress can be a subject attribute or a SAN extension
  let email = get('emailAddress') || get('E') || '';
  if (!email) {
    try {
      const sanExt = cert.getExtension('subjectAltName');
      if (sanExt && sanExt.altNames) {
        const emailSan = sanExt.altNames.find(a => a.type === 1); // rfc822Name
        if (emailSan) email = emailSan.value;
      }
    } catch {}
  }

  // ── Issuer ──
  const iss       = cert.issuer;
  const issuedBy  = (iss.getField('CN') || iss.getField('commonName'))?.value || '';

  // ── Validity ──
  const issueDate  = cert.validity.notBefore.toISOString().split('T')[0];
  const expiryDate = cert.validity.notAfter.toISOString().split('T')[0];

  // ── Serial number — format as uppercase hex ──
  let serialHex = cert.serialNumber.toUpperCase();
  // Ensure it's hex pairs separated by colons if long
  if (serialHex.length > 16) {
    serialHex = serialHex.match(/.{1,2}/g).join(':');
  }

  // ── Key Usage → DSC Purpose ──
  let dscPurpose = 'Signing';
  try {
    const ku = cert.getExtension('keyUsage');
    if (ku) {
      const hasSigning    = ku.digitalSignature || ku.nonRepudiation || ku.contentCommitment;
      const hasEncryption = ku.keyEncipherment  || ku.dataEncipherment;
      if (hasSigning && hasEncryption) dscPurpose = 'Signing & Encryption';
      else if (hasEncryption)          dscPurpose = 'Encryption';
      else                             dscPurpose = 'Signing';
    }
  } catch {}

  // ── Certificate Policies → DSC Class ──
  let dscClass = 'Class 3';
  try {
    const policiesExt = cert.getExtension('certificatePolicies');
    if (policiesExt) {
      const rawJson = JSON.stringify(policiesExt);
      for (const [oid, label] of Object.entries(DSC_CLASS_OIDS)) {
        if (rawJson.includes(oid)) {
          dscClass = label;
          break;
        }
      }
    }
  } catch {}

  // ── SHA-256 fingerprint ──
  let fingerprint = '';
  try {
    const md = forge.md.sha256.create();
    md.update(binaryStr);
    fingerprint = md.digest().toHex().toUpperCase().match(/.{2}/g).join(':');
  } catch {}

  return {
    holder_name:    holderName,
    organization:   org,
    org_unit:       orgUnit,
    city,
    state,
    country,
    email,
    serial_number:  serialHex,
    issued_by:      issuedBy,
    issue_date:     issueDate,
    expiry_date:    expiryDate,
    dsc_purpose:    dscPurpose,
    dsc_class:      dscClass,
    fingerprint_sha256: fingerprint,
  };
}

module.exports = { parseCertDER };
