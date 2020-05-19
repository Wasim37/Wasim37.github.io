var Sre = require('speech-rule-engine');
global.SRE = Sre;
global.sre = Object.create(Sre);
global.sre.Engine = { isReady: function () { return Sre.engineReady(); } };
//# sourceMappingURL=sre-node.js.map