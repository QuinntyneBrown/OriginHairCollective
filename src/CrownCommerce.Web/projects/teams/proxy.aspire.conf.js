const gatewayUrl =
  process.env['services__api-gateway__https__0'] ||
  process.env['services__api-gateway__http__0'] ||
  'http://localhost:5000';

module.exports = [
  {
    context: ['/api'],
    target: gatewayUrl,
    secure: false,
  },
  {
    context: ['/hubs'],
    target: gatewayUrl,
    secure: false,
    ws: true,
  },
];
