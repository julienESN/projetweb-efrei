"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityType = void 0;
const graphql_1 = require("@nestjs/graphql");
var EntityType;
(function (EntityType) {
    EntityType["DOCUMENT"] = "DOCUMENT";
    EntityType["USER"] = "USER";
})(EntityType || (exports.EntityType = EntityType = {}));
(0, graphql_1.registerEnumType)(EntityType, {
    name: 'EntityType',
    description: "Les types d'entités du système",
});
//# sourceMappingURL=entity-type.enum.js.map