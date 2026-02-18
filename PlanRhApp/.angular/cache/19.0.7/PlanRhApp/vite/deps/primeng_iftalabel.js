import {
  RouterModule
} from "./chunk-NWL5LC6M.js";
import {
  BaseComponent
} from "./chunk-2GKBHXIW.js";
import "./chunk-65RNTWF2.js";
import {
  BaseStyle
} from "./chunk-PW6MM5QO.js";
import {
  SharedModule
} from "./chunk-TLOYCUC3.js";
import "./chunk-3W2S2FJI.js";
import "./chunk-O7FCMJ3I.js";
import {
  CommonModule
} from "./chunk-QWARKMCI.js";
import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
  NgModule,
  ViewEncapsulation,
  inject,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵInheritDefinitionFeature,
  ɵɵProvidersFeature,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵgetInheritedFactory,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵsetNgModuleScope
} from "./chunk-UUF7AXPT.js";
import "./chunk-5AZMPBFP.js";
import "./chunk-KT3NRA3D.js";
import "./chunk-FMZF26QI.js";
import "./chunk-WDMUDEB6.js";

// node_modules/primeng/fesm2022/primeng-iftalabel.mjs
var theme = ({
  dt
}) => `
.p-iftalabel {
    display: block;
    position: relative;
}

.p-iftalabel label {
    position: absolute;
    pointer-events: none;
    top: ${dt("iftalabel.top")};
    transition-property: all;
    transition-timing-function: ease;
    line-height: 1;
    font-size: ${dt("iftalabel.font.size")};
    font-weight: ${dt("iftalabel.font.weight")};
    inset-inline-start: ${dt("iftalabel.position.x")};
    color: ${dt("iftalabel.color")};
    transition-duration: ${dt("iftalabel.transition.duration")};
}

.p-iftalabel .p-inputtext,
.p-iftalabel .p-textarea,
.p-iftalabel .p-select-label,
.p-iftalabel .p-multiselect-label-container,
.p-iftalabel .p-autocomplete-input-multiple,
.p-iftalabel .p-cascadeselect-label,
.p-iftalabel .p-treeselect-label {
    padding-top: ${dt("iftalabel.input.padding.top")};
}

.p-iftalabel:has(.ng-invalid.ng-dirty) label {
    color: ${dt("iftalabel.invalid.color")};
}

.p-iftalabel:has(input:focus) label,
.p-iftalabel:has(input:-webkit-autofill) label,
.p-iftalabel:has(textarea:focus) label,
.p-iftalabel:has(.p-inputwrapper-focus) label {
    color: ${dt("iftalabel.focus.color")};
}

.p-iftalabel .p-inputicon {
    top: ${dt("iftalabel.input.padding.top")};
    transform: translateY(25%);
    margin-top: 0;
}

/*.p-iftalabel .p-placeholder,
.p-iftalabel input::placeholder,
.p-iftalabel .p-inputtext::placeholder {
    opacity: 0;
    transition-property: all;
    transition-timing-function: ease;
}

.p-iftalabel .p-focus .p-placeholder,
.p-iftalabel input:focus::placeholder,
.p-iftalabel .p-inputtext:focus::placeholder {
    opacity: 1;
    transition-property: all;
    transition-timing-function: ease;
}*/
`;
var classes = {
  root: "p-iftalabel"
};
var IftaLabelStyle = class _IftaLabelStyle extends BaseStyle {
  name = "iftalabel";
  theme = theme;
  classes = classes;
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵIftaLabelStyle_BaseFactory;
    return function IftaLabelStyle_Factory(__ngFactoryType__) {
      return (ɵIftaLabelStyle_BaseFactory || (ɵIftaLabelStyle_BaseFactory = ɵɵgetInheritedFactory(_IftaLabelStyle)))(__ngFactoryType__ || _IftaLabelStyle);
    };
  })();
  static ɵprov = ɵɵdefineInjectable({
    token: _IftaLabelStyle,
    factory: _IftaLabelStyle.ɵfac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(IftaLabelStyle, [{
    type: Injectable
  }], null, null);
})();
var IftaLabelClasses;
(function(IftaLabelClasses2) {
  IftaLabelClasses2["root"] = "p-iftalabel";
})(IftaLabelClasses || (IftaLabelClasses = {}));
var _c0 = ["*"];
var IftaLabel = class _IftaLabel extends BaseComponent {
  _componentStyle = inject(IftaLabelStyle);
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵIftaLabel_BaseFactory;
    return function IftaLabel_Factory(__ngFactoryType__) {
      return (ɵIftaLabel_BaseFactory || (ɵIftaLabel_BaseFactory = ɵɵgetInheritedFactory(_IftaLabel)))(__ngFactoryType__ || _IftaLabel);
    };
  })();
  static ɵcmp = ɵɵdefineComponent({
    type: _IftaLabel,
    selectors: [["p-iftalabel"], ["p-iftaLabel"], ["p-ifta-label"]],
    hostAttrs: [1, "p-iftalabel"],
    features: [ɵɵProvidersFeature([IftaLabelStyle]), ɵɵInheritDefinitionFeature],
    ngContentSelectors: _c0,
    decls: 1,
    vars: 0,
    template: function IftaLabel_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵprojectionDef();
        ɵɵprojection(0);
      }
    },
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(IftaLabel, [{
    type: Component,
    args: [{
      selector: "p-iftalabel, p-iftaLabel, p-ifta-label",
      standalone: true,
      template: ` <ng-content></ng-content> `,
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      providers: [IftaLabelStyle],
      host: {
        class: "p-iftalabel"
      }
    }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && ɵsetClassDebugInfo(IftaLabel, {
    className: "IftaLabel",
    filePath: "iftalabel.ts",
    lineNumber: 23
  });
})();
var IftaLabelModule = class _IftaLabelModule {
  static ɵfac = function IftaLabelModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _IftaLabelModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _IftaLabelModule
  });
  static ɵinj = ɵɵdefineInjector({
    imports: [CommonModule, SharedModule, RouterModule, SharedModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(IftaLabelModule, [{
    type: NgModule,
    args: [{
      imports: [IftaLabel, CommonModule, SharedModule, RouterModule],
      exports: [IftaLabel, SharedModule]
    }]
  }], null, null);
})();
(function() {
  (typeof ngJitMode === "undefined" || ngJitMode) && ɵɵsetNgModuleScope(IftaLabelModule, {
    imports: [IftaLabel, CommonModule, SharedModule, RouterModule],
    exports: [IftaLabel, SharedModule]
  });
})();
export {
  IftaLabel,
  IftaLabelClasses,
  IftaLabelModule,
  IftaLabelStyle
};
//# sourceMappingURL=primeng_iftalabel.js.map
