import { legalFil } from "@/i18n/translations/legal-fil";
import type { TranslationTree } from "@/i18n/types";

export const filPH: TranslationTree = {
    common: {
        back: "Bumalik",
        menu: "Menu",
        settings: "Settings",
        cancel: "Kanselahin",
        remove: "Alisin",
        ok: "Sige",
        signIn: "Mag-sign in",
        email: "Email",
        password: "Password",
        name: "Pangalan",
        done: "Tapos",
        close: "Isara",
        genericError: "May naganap na error. Subukan muli.",
    },
    home: {
        documentsTitle: "Mga Dokumento",
        documentsSubtitle: "Mga sertipiko, clearance, at iba pa",
        idsTitle: "Mga ID",
        idsSubtitle: "Tingnan at i-upload ang mga ID",
        aiTitle: "Magpatulong sa AI",
        aiSubtitle: "Magtanong at humingi ng tulong",
        tagline:
            "Ako si Aidey, ang iyong Gabay sa Dokumento at ID! Piliin ang kailangan mo sa mga opsyon sa itaas.",
        dropdownLabel: "Menu",
        dropdownPlaceholder: "Pumili",
        greeting: "Kumusta, {{name}}",
    },
    auth: {
        signInTagline: "Mag-sign in para magpatuloy sa Aidey.",
        signUpTagline:
            "Gumawa ng account para simulan ang iyong gabay sa dokumento at ID.",
        firebaseSetupTitle: "Kailangan ng Firebase setup",
        firebaseSetupBody:
            "Idagdag ang Firebase config sa `.env` file mo bago mag-sign in. Tingnan ang `.env.example` para sa mga kailangang variable.",
        namePlaceholder: "Hal. Juan Dela Cruz",
        passwordPlaceholder: "Hindi bababa sa 6 na character",
        createAccount: "Gumawa ng account",
        signIn: "Mag-sign in",
        noAccount: "Wala pang account? Gumawa ng bago",
        hasAccount: "May account na? Mag-sign in",
        termsAcceptPrefix: "Sumasang-ayon ako sa",
        termsAcceptLink: "Terms and Conditions",
        termsRequired:
            "Kailangan mong tanggapin ang Terms and Conditions para makagawa ng account.",
        signOut: "Mag-sign out",
        signOutConfirmTitle: "Mag-sign out?",
        signOutConfirmMessage:
            "Sigurado ka bang gusto mong mag-sign out sa Aidey?",
        noName: "Walang pangalan",
        noEmail: "Walang email",
        firebaseIncomplete:
            "Firebase config ay hindi kumpleto. Maaaring hindi gumana ang Storage at Realtime Database sa susunod na setup.",
        errors: {
            "auth/email-already-in-use":
                "May account na gamit ang email na ito.",
            "auth/invalid-email": "Hindi wasto ang email address.",
            "auth/operation-not-allowed":
                "Hindi pa naka-enable ang sign-in method na ito sa Firebase.",
            "auth/weak-password":
                "Dapat hindi bababa sa 6 na character ang password.",
            "auth/user-disabled": "Na-disable ang account na ito.",
            "auth/user-not-found":
                "Walang account na tumutugma sa email at password.",
            "auth/wrong-password": "Mali ang email o password.",
            "auth/invalid-credential": "Mali ang email o password.",
            "auth/too-many-requests":
                "Masyadong maraming pagtatangka. Subukan muli mamaya.",
            "auth/network-request-failed":
                "May problema sa internet. Suriin ang koneksyon mo.",
        },
    },
    settings: {
        title: "Settings",
        general: "Pangkalahatan",
        support: "Suporta",
        account: "Aking Account",
        notifications: "Mga Abiso",
        language: "Wika",
        help: "Tulong",
        privacyPolicy: "Privacy Policy",
        termsAndConditions: "Terms and Conditions",
        about: "Tungkol sa Aidey",
        session: "Sesyon",
    },
    language: {
        title: "Wika",
        subtitle: "Piliin ang wika ng app",
    },
    documents: {
        title: "Mga Dokumento",
        searchPlaceholder: "I-type dito ang kailangan",
        empty: "Walang nahanap na dokumento.",
        loading: "Ikinakarga ang iyong mga dokumento...",
        syncing: "Nagsi-sync...",
        speechToText: "Speech to text",
        helpPrompt:
            "Wala pa akong {{label}}. Paano ako makakakuha nito at ano ang mga kinakailangan?",
        detailHint: "Piliin ang angkop na opsyon para sa iyo.",
        dontHave: "WALA pa akong {{title}}",
        alreadyHave: "MAYROON na akong {{title}}",
        walaMessage:
            "Tutulungan ka namin hakbang-hakbang — mula sa mga kinakailangan hanggang sa direksyon sa pinakamalapit na opisina gamit ang mapa.",
        walaAiButton: "Magpatulong sa Aidey AI",
        walaStepsButton: "Sundin na lang ang hakbang-hakbang",
        mayroonMessage:
            "I-upload ang iyong {{title}} para mai-save ito sa Aidey at madaling mahanap kapag kailangan mo.",
        steps: {
            intro: "Sundan ang tatlong hakbang na ito nang paisa-isa. Kumpletuhin ang isang seksyon para mabuksan ang susunod.",
            empty: "Wala pang detalyadong gabay para dito. Subukan ang Aidey AI Assistant para sa tulong.",
            requirements: "Mga Kinakailangan",
            steps: "Mga Hakbang",
            upload: "I-upload",
            checked: "{{count}}/{{total}} natsek",
            stepsDone: "{{count}}/{{total}} tapos",
            estimatedTime: "Tinatayang tagal: {{timeline}}",
            uploadCount: "{{count}} larawan na-upload",
            uploadHint: "I-upload ang larawan ng dokumento",
            autoBadge: "Mayroon ka na nito sa Aidey",
            getFirst: "Kunin muna: {{label}}",
            finishRequirements: "Tapos na, may dala na ako",
            finishSteps: "Tapos na ang lahat ng hakbang",
            completeTitle: "Handa ka na!",
            completeMessage:
                "Nakumpleto mo na ang hakbang-hakbang para sa {{title}}. Puwede mo na itong dalhin sa opisina.",
            incompleteTitle: "Kulang pa",
            incompleteRequirements:
                "Tsekan muna ang lahat ng kinakailangan bago magpatuloy.",
            incompleteSteps:
                "Tsekan muna ang lahat ng hakbang na natapos mo bago magpatuloy.",
            noPhotoTitle: "Wala pang larawan",
            noPhotoMessage:
                "Mag-upload muna ng kuha o larawan ng iyong dokumento bago tapusin.",
        },
        upload: {
            saveError: "Hindi ma-save ang larawan",
            saveErrorBody:
                "Pakisubukang muli. Siguraduhing may sapat na espasyo ang iyong device.",
            removeTitle: "Alisin ang larawan?",
            removeBody: "Hindi na ito maibabalik pagkatapos alisin.",
            removeError: "Hindi maalis ang larawan",
            permissionTitle: "Kailangan ng pahintulot",
            cameraPermission:
                "Bigyan ng access sa camera ang Aidey para makakuha ng larawan.",
            photosPermission:
                "Bigyan ng access sa photos ang Aidey para makapili ng larawan.",
            removeA11y: "Alisin ang larawan",
            takePhoto: "Kunan ng larawan ang {{title}}",
            takeMore: "Kumuha pa ng larawan",
            cameraHint: "Pindutin para gamitin ang camera",
            uploadPhoto: "I-upload ang {{title}}",
            uploadMore: "Mag-upload pa ng larawan",
            libraryHint: "Pindutin para pumili ng larawan",
            downloading:
                "Dina-download ang larawan mula sa iyong ibang device...",
        },
    },
    ids: {
        title: "Mga ID",
        searchPlaceholder: "I-type dito ang ID na kailangan",
        empty: "Walang nahanap na ID.",
        loading: "Ikinakarga ang iyong mga ID...",
    },
    ai: {
        welcome: "Kumusta!",
        welcomeText:
            "Gabayan kita hakbang-hakbang sa dokumento o ID na kailangan mo.",
        placeholder: "I-type ang tanong mo dito...",
        camera: "Camera",
        uploadImage: "Upload image",
        imagePrompt: "Maaari mo bang tulungan ako sa larawang ito?",
        removeImage: "Alisin ang larawan",
        sendMessage: "Send message",
        locationError:
            "Hindi makuha ang lokasyon. Subukan muli o i-type ang iyong lungsod.",
        arrivalMessage:
            "Narating ko na ang {{name}}. Malapit na ako sa opisina.",
        welcomeSuggestions: {
            philId: {
                label: "Kumuha ng PhilID",
                value: "Gusto kong kumuha ng PhilID / National ID.",
            },
            requirements: {
                label: "Ano ang kailangan?",
                value: "Ano ang mga dokumentong kailangan para sa isang government ID?",
            },
            findOffice: {
                label: "Hanapin ang opisina",
                value: "Tulungan mo akong hanapin ang pinakamalapit na opisina ng gobyerno.",
            },
        },
        fallbackSuggestions: {
            yes: { label: "Oo", value: "Oo" },
            no: { label: "Hindi", value: "Hindi" },
            how: { label: "Paano?", value: "Pakipaliwanag pa." },
        },
        checklist: {
            gather: "Ihanda ang mga kinakailangang dokumento{{suffix}}",
            goToOffice: "Pumunta sa opisina",
            talkToStaff: "Kausapin ang clerk o staff",
            complete: "Kumpletuhin ang aplikasyon o tanggapin ang output",
            suffix: " ng {{label}}",
        },
        taskProgress: "Progreso ng Gawain",
        progressDone: "{{done}}/{{total}} tapos",
        collapseChecklist: "I-minimize ang checklist",
        expandChecklist: "Palawakin ang checklist",
        finishTask: "Tapos ko na ito",
        taskDone: "Magaling! Natapos mo na ang hakbang na ito.",
        addToGallery: "Idagdag sa Gallery",
        comingSoon: "Paparating na",
        addToGalleryA11y: "Idagdag ang {{label}} sa gallery",
        newChat: "New Chat",
        noChats: "Wala pang nakaraang chat.",
        archived: "Naka-archive ({{count}})",
        collapseArchived: "I-minimize ang archived",
        expandArchived: "Ipakita ang archived",
        archiveChat: "I-archive ang chat",
        unarchiveChat: "I-unarchive ang chat",
        defaultSessionTitle: "Bagong Chat",
        noAiResponse: "Walang natanggap na sagot mula sa AI.",
        stepLabel: "Hakbang {{current}} ng {{total}}",
        stepLabelShort: "Hakbang {{current}}",
    },
    maps: {
        title: "Ruta sa Mapa",
        you: "Ikaw",
        locationNotFound: "Hindi mahanap ang lokasyon sa mapa.",
        apiKeyHint: "Idagdag ang EXPO_PUBLIC_GOOGLE_MAPS_API_KEY para sa ruta.",
        openMap: "Buksan ang mapa",
        viewRoute: "Tingnan ang ruta",
        viewOnMap: "Tingnan sa mapa",
        officeFound:
            "Narito ang pinakamalapit na opisina ng {{agency}}: {{officeName}}{{addressSuffix}}. Tingnan ang ruta sa mapa sa ibaba.",
        officeFoundAddressSuffix: " sa {{address}}",
        locationPermission:
            "Kailangan namin ng iyong lokasyon para mahanap ang pinakamalapit na opisina.",
        locationMessage:
            "Nasa {{label}} ako ({{latitude}}, {{longitude}}). Hanapin ang pinakamalapit na opisina.",
        errors: {
            enableRoutesApi:
                "I-enable ang Routes API sa Google Cloud Console para sa ruta sa mapa.",
            enableBilling:
                "Kailangan i-enable ang billing sa Google Cloud project para sa Google Maps.",
            useRoutesApi:
                "I-enable ang Routes API (hindi ang legacy Directions API) sa Google Cloud Console.",
            invalidApiKey:
                "Hindi valid ang Google Maps API key o wala itong access sa Routes API.",
            loadRoute: "Hindi ma-load ang ruta sa mapa.",
            noRoute:
                "Walang nahanap na ruta mula sa iyong lokasyon papunta sa opisina.",
            missingApiKey:
                "Idagdag ang EXPO_PUBLIC_GOOGLE_MAPS_API_KEY para sa ruta.",
        },
    },
    speech: {
        stopListening: "Ihinto ang pakikinig",
        startListening: "Speech to text ({{language}})",
        toggleHint:
            "I-tap-and-hold para lumipat ng wika sa pagitan ng Filipino at English",
        micPermission:
            "Kailangan ng pahintulot sa microphone para gumana ang speech-to-text.",
        processError: "Hindi na-proseso ang boses. Subukan muli.",
        startError: "Hindi ma-simulan ang speech-to-text. Subukan muli.",
    },
    connection: {
        title: "Problema sa Koneksyon",
        message:
            "Siguraduhing nakakonekta ka sa internet. Kung nakakonekta ka na, maaaring hindi stable ang iyong koneksyon.",
        aiUnavailableTitle: "AIDEY Hindi Available",
        aiUnavailableMessage:
            "AIDEY isn't available for now. Something went wrong, please try again later.",
    },
    legal: legalFil,
};
