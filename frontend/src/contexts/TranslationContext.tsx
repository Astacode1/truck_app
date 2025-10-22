import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Translation dictionaries
const translations = {
  English: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.analytics': 'Analytics',
    'nav.trucks': 'Trucks',
    'nav.trips': 'Trips',
    'nav.drivers': 'Drivers',
    'nav.invoices': 'Invoices',
    'nav.ifta_calculator': 'IFTA Calculator',
    'nav.ifta_form': 'IFTA Form Generator',
    'nav.maintenance': 'Maintenance',
    'nav.reports': 'Reports',
    'nav.safety': 'Safety',
    'nav.settings': 'Settings',
    'nav.notifications': 'Notifications',
    
    // Settings Page
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your account, preferences, and application settings',
    'settings.profile': 'Profile',
    'settings.appearance': 'Appearance',
    'settings.notifications': 'Notifications',
    'settings.data_management': 'Data Management',
    'settings.system': 'System',
    
    // Profile Tab
    'profile.title': 'Profile Information',
    'profile.edit': 'Edit Profile',
    'profile.save': 'Save',
    'profile.cancel': 'Cancel',
    'profile.firstName': 'First Name',
    'profile.lastName': 'Last Name',
    'profile.fullName': 'Full Name',
    'profile.username': 'Username',
    'profile.email': 'Email',
    'profile.phone': 'Phone',
    'profile.company': 'Company',
    'profile.address': 'Address',
    'profile.role': 'Role',
    'profile.joinDate': 'Join Date',
    'profile.fullNamePlaceholder': 'Enter your full name',
    'profile.usernamePlaceholder': 'Enter your username',
    'profile.emailPlaceholder': 'Enter your email',
    'profile.passwordPlaceholder': 'Enter your password',
    'profile.password': 'Password',
    
    // Appearance Tab
    'appearance.title': 'Appearance Settings',
    'appearance.theme': 'Theme',
    'appearance.lightMode': 'Light Mode',
    'appearance.darkMode': 'Dark Mode',
    'appearance.autoMode': 'Auto (Coming Soon)',
    'appearance.companyLogo': 'Company Logo Text',
    
    // Notifications Tab
    'notifications.title': 'Notification Settings',
    'notifications.push': 'Push Notifications',
    'notifications.pushDescription': 'Receive notifications in the application',
    'notifications.email': 'Email Notifications',
    'notifications.emailDescription': 'Receive notifications via email',
    
    // Data Management Tab
    'dataManagement.title': 'Data Management',
    'dataManagement.autoSave': 'Auto Save',
    'dataManagement.autoSaveDescription': 'Automatically save changes as you work',
    'dataManagement.autoBackup': 'Auto Backup',
    'dataManagement.autoBackupDescription': 'Automatically backup data daily',
    'dataManagement.dataRetention': 'Data Retention (days)',
    'dataManagement.exportImport': 'Data Export & Import',
    'dataManagement.exportData': 'Export Data',
    'dataManagement.importData': 'Import Data',
    'dataManagement.clearAllData': 'Clear All Data',
    'dataManagement.importComingSoon': 'Import feature coming soon!',
    'dataManagement.clearConfirm': 'Are you sure you want to clear all application data? This action cannot be undone.',
    'dataManagement.clearSuccess': 'All data cleared successfully!',
    
    // System Tab
    'system.title': 'System Settings',
    'system.defaultCurrency': 'Default Currency',
    'system.dateFormat': 'Date Format',
    'system.timeFormat': 'Time Format',
    'system.language': 'Language',
    'system.systemInfo': 'System Information',
    'system.12Hour': '12-hour',
    'system.24Hour': '24-hour',
    'system.english': 'English',
    'system.spanish': 'Spanish',
    'system.french': 'French',
    'system.german': 'German',
    
    // Maintenance Page
    'maintenance.title': 'Truck Maintenance & Expenses',
    'maintenance.generateReport': 'Generate Report',
    'maintenance.totalFleet': 'Total Fleet',
    'maintenance.activeTrucks': 'Active Trucks',
    'maintenance.monthlyExpenses': 'Monthly Expenses',
    'maintenance.allCategories': 'All Categories',
    'maintenance.avgPerTruck': 'Avg per Truck',
    'maintenance.monthlyAverage': 'Monthly Average',
    'maintenance.inMaintenance': 'In Maintenance',
    'maintenance.currently': 'Currently',
    'maintenance.selectTruck': 'Select Truck',
    'maintenance.expenses': 'Expenses',
    'maintenance.lastMaintenance': 'Last Maintenance',
    'maintenance.categoryTotal': 'Category Total',
    'maintenance.highCost': 'High Cost',
    'maintenance.mediumCost': 'Medium Cost',
    'maintenance.lowCost': 'Low Cost',
    'maintenance.deleteExpense': 'Delete expense',
    'maintenance.delete': 'Delete',
    'maintenance.noExpenses': 'No',
    'maintenance.expensesRecorded': 'expenses recorded',
    'maintenance.expenseSummary': 'Expense Summary for',
    'maintenance.entries': 'entries',
    'maintenance.hideDetails': 'Hide Details',
    'maintenance.showDetails': 'Show Details',
    'maintenance.detailedBreakdown': 'Detailed Breakdown',
    'maintenance.total': 'Total',
    'maintenance.ofTotal': 'of total',
    'maintenance.grandTotal': 'GRAND TOTAL',
    'maintenance.allExpensesCombined': 'All expenses combined',
    'maintenance.totalEntries': 'total entries',
    'maintenance.allEntries': 'All Entries - Complete Itemized List',
    'maintenance.editTruck': 'Edit Truck',
    'maintenance.scheduleMaintenance': 'Schedule Maintenance',
    'maintenance.markInMaintenance': 'Mark In Maintenance',
    'maintenance.markActive': 'Mark Active',
    'maintenance.addNewExpense': 'Add New Expense',
    'maintenance.truck': 'Truck',
    'maintenance.category': 'Category',
    'maintenance.repair': 'Repair',
    'maintenance.upkeep': 'Upkeep',
    'maintenance.miscellaneous': 'Miscellaneous',
    'maintenance.materials': 'Materials',
    'maintenance.date': 'Date',
    'maintenance.cost': 'Cost',
    'maintenance.description': 'Description',
    'maintenance.descriptionPlaceholder': 'e.g., Brake pad replacement',
    'maintenance.vendor': 'Vendor',
    'maintenance.vendorPlaceholder': 'e.g., AutoZone',
    'maintenance.cancel': 'Cancel',
    'maintenance.addExpense': 'Add Expense',
    'maintenance.miles': 'miles',
    'maintenance.totalMonthlyExpenses': 'Total Monthly Expenses',
    'maintenance.expenseCategories': 'Expense Categories',
    'maintenance.quickActions': 'Quick Actions',
    'maintenance.editTruckDetails': 'Edit Truck Details',
    'maintenance.model': 'Model',
    'maintenance.modelPlaceholder': 'e.g., Volvo VNL 760',
    'maintenance.year': 'Year',
    'maintenance.mileage': 'Mileage',
    'maintenance.status': 'Status',
    'maintenance.active': 'Active',
    'maintenance.maintenanceStatus': 'Maintenance',
    'maintenance.inactive': 'Inactive',
    'maintenance.nextMaintenance': 'Next Maintenance',
    'maintenance.saveChanges': 'Save Changes',
    'maintenance.subtotal': 'Subtotal',
    
    // Common
    'common.light': 'Light',
    'common.dark': 'Dark',
    'common.success': 'Success',
    'common.error': 'Error',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.close': 'Close',
    
    // Messages
    'msg.profile_updated': 'Profile updated successfully!',
    'msg.settings_updated': 'Settings updated successfully!',
    'msg.export_success': 'Data export report generated successfully!',
    'msg.import_coming': 'Import feature coming soon!',
    'msg.clear_confirm': 'Are you sure you want to clear all application data? This action cannot be undone.',
    'msg.data_cleared': 'All data cleared successfully!'
  },
  
  French: {
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.analytics': 'Analyses',
    'nav.trucks': 'Camions',
    'nav.trips': 'Voyages',
    'nav.drivers': 'Chauffeurs',
    'nav.invoices': 'Factures',
    'nav.ifta_calculator': 'Calculateur IFTA',
    'nav.ifta_form': 'Générateur de formulaire IFTA',
    'nav.maintenance': 'Maintenance',
    'nav.reports': 'Rapports',
    'nav.safety': 'Sécurité',
    'nav.settings': 'Paramètres',
    'nav.notifications': 'Notifications',
    
    // Settings Page
    'settings.title': 'Paramètres',
    'settings.subtitle': 'Gérez votre compte, préférences et paramètres de l\'application',
    'settings.profile': 'Profil',
    'settings.appearance': 'Apparence',
    'settings.notifications': 'Notifications',
    'settings.data_management': 'Gestion des données',
    'settings.system': 'Système',
    
    // Profile Tab
    'profile.title': 'Informations du profil',
    'profile.edit': 'Modifier le profil',
    'profile.save': 'Sauvegarder',
    'profile.cancel': 'Annuler',
    'profile.firstName': 'Prénom',
    'profile.lastName': 'Nom de famille',
    'profile.fullName': 'Nom complet',
    'profile.username': 'Nom d\'utilisateur',
    'profile.email': 'E-mail',
    'profile.phone': 'Téléphone',
    'profile.company': 'Entreprise',
    'profile.address': 'Adresse',
    'profile.role': 'Rôle',
    'profile.joinDate': 'Date d\'embauche',
    'profile.fullNamePlaceholder': 'Saisissez votre nom complet',
    'profile.usernamePlaceholder': 'Saisissez votre nom d\'utilisateur',
    'profile.emailPlaceholder': 'Saisissez votre e-mail',
    'profile.passwordPlaceholder': 'Saisissez votre mot de passe',
    'profile.password': 'Mot de passe',
    
    // Appearance Tab
    'appearance.title': 'Paramètres d\'apparence',
    'appearance.theme': 'Thème',
    'appearance.lightMode': 'Mode clair',
    'appearance.darkMode': 'Mode sombre',
    'appearance.autoMode': 'Auto (Bientôt disponible)',
    'appearance.companyLogo': 'Texte du logo de l\'entreprise',
    
    // Notifications Tab
    'notifications.title': 'Paramètres de notification',
    'notifications.push': 'Notifications push',
    'notifications.pushDescription': 'Recevoir des notifications dans l\'application',
    'notifications.email': 'Notifications par e-mail',
    'notifications.emailDescription': 'Recevoir des notifications par e-mail',
    
    // Data Management Tab
    'dataManagement.title': 'Gestion des données',
    'dataManagement.autoSave': 'Sauvegarde automatique',
    'dataManagement.autoSaveDescription': 'Sauvegarder automatiquement les modifications',
    'dataManagement.autoBackup': 'Sauvegarde automatique',
    'dataManagement.autoBackupDescription': 'Sauvegarder automatiquement les données quotidiennement',
    'dataManagement.dataRetention': 'Rétention des données (jours)',
    'dataManagement.exportImport': 'Exportation et importation de données',
    'dataManagement.exportData': 'Exporter les données',
    'dataManagement.importData': 'Importer les données',
    'dataManagement.clearAllData': 'Effacer toutes les données',
    'dataManagement.importComingSoon': 'Fonction d\'importation bientôt disponible !',
    'dataManagement.clearConfirm': 'Êtes-vous sûr de vouloir effacer toutes les données de l\'application ? Cette action ne peut pas être annulée.',
    'dataManagement.clearSuccess': 'Toutes les données ont été effacées avec succès !',
    
    // System Tab
    'system.title': 'Paramètres système',
    'system.defaultCurrency': 'Devise par défaut',
    'system.dateFormat': 'Format de date',
    'system.timeFormat': 'Format d\'heure',
    'system.language': 'Langue',
    'system.systemInfo': 'Informations système',
    'system.12Hour': '12 heures',
    'system.24Hour': '24 heures',
    'system.english': 'Anglais',
    'system.spanish': 'Espagnol',
    'system.french': 'Français',
    'system.german': 'Allemand',
    'system.updated': 'Dernière mise à jour:',
    'system.storage': 'Stockage des données:',
    'system.theme_info': 'Thème:',
    
    // Maintenance Page
    'maintenance.title': 'Maintenance et dépenses des camions',
    'maintenance.generateReport': 'Générer un rapport',
    'maintenance.totalFleet': 'Flotte totale',
    'maintenance.activeTrucks': 'Camions actifs',
    'maintenance.monthlyExpenses': 'Dépenses mensuelles',
    'maintenance.allCategories': 'Toutes catégories',
    'maintenance.avgPerTruck': 'Moy. par camion',
    'maintenance.monthlyAverage': 'Moyenne mensuelle',
    'maintenance.inMaintenance': 'En maintenance',
    'maintenance.currently': 'Actuellement',
    'maintenance.selectTruck': 'Sélectionner un camion',
    'maintenance.expenses': 'Dépenses',
    'maintenance.lastMaintenance': 'Dernière maintenance',
    'maintenance.categoryTotal': 'Total de catégorie',
    'maintenance.highCost': 'Coût élevé',
    'maintenance.mediumCost': 'Coût moyen',
    'maintenance.lowCost': 'Coût faible',
    'maintenance.deleteExpense': 'Supprimer la dépense',
    'maintenance.delete': 'Supprimer',
    'maintenance.noExpenses': 'Aucune',
    'maintenance.expensesRecorded': 'dépenses enregistrées',
    'maintenance.expenseSummary': 'Résumé des dépenses pour',
    'maintenance.entries': 'entrées',
    'maintenance.hideDetails': 'Masquer les détails',
    'maintenance.showDetails': 'Afficher les détails',
    'maintenance.detailedBreakdown': 'Répartition détaillée',
    'maintenance.total': 'Total',
    'maintenance.ofTotal': 'du total',
    'maintenance.grandTotal': 'TOTAL GÉNÉRAL',
    'maintenance.allExpensesCombined': 'Toutes les dépenses combinées',
    'maintenance.totalEntries': 'entrées au total',
    'maintenance.allEntries': 'Toutes les entrées - Liste détaillée complète',
    'maintenance.editTruck': 'Modifier le camion',
    'maintenance.scheduleMaintenance': 'Programmer la maintenance',
    'maintenance.markInMaintenance': 'Marquer en maintenance',
    'maintenance.markActive': 'Marquer actif',
    'maintenance.addNewExpense': 'Ajouter une nouvelle dépense',
    'maintenance.truck': 'Camion',
    'maintenance.category': 'Catégorie',
    'maintenance.repair': 'Réparation',
    'maintenance.upkeep': 'Entretien',
    'maintenance.miscellaneous': 'Divers',
    'maintenance.materials': 'Matériaux',
    'maintenance.date': 'Date',
    'maintenance.cost': 'Coût',
    'maintenance.description': 'Description',
    'maintenance.descriptionPlaceholder': 'ex. Remplacement des plaquettes de frein',
    'maintenance.vendor': 'Fournisseur',
    'maintenance.vendorPlaceholder': 'ex. AutoZone',
    'maintenance.cancel': 'Annuler',
    'maintenance.addExpense': 'Ajouter une dépense',
    'maintenance.miles': 'miles',
    'maintenance.totalMonthlyExpenses': 'Total des dépenses mensuelles',
    'maintenance.expenseCategories': 'Catégories de dépenses',
    'maintenance.quickActions': 'Actions rapides',
    'maintenance.editTruckDetails': 'Modifier les détails du camion',
    'maintenance.model': 'Modèle',
    'maintenance.modelPlaceholder': 'ex. Volvo VNL 760',
    'maintenance.year': 'Année',
    'maintenance.mileage': 'Kilométrage',
    'maintenance.status': 'Statut',
    'maintenance.active': 'Actif',
    'maintenance.maintenanceStatus': 'Maintenance',
    'maintenance.inactive': 'Inactif',
    'maintenance.nextMaintenance': 'Prochaine maintenance',
    'maintenance.saveChanges': 'Sauvegarder les modifications',
    'maintenance.subtotal': 'Sous-total',
    
    // Common
    'common.light': 'Clair',
    'common.dark': 'Sombre',
    'common.success': 'Succès',
    'common.error': 'Erreur',
    'common.loading': 'Chargement...',
    'common.save': 'Sauvegarder',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.add': 'Ajouter',
    'common.close': 'Fermer',
    
    // Messages
    'msg.profile_updated': 'Profil mis à jour avec succès!',
    'msg.settings_updated': 'Paramètres mis à jour avec succès!',
    'msg.export_success': 'Rapport d\'exportation de données généré avec succès!',
    'msg.import_coming': 'Fonction d\'importation bientôt disponible!',
    'msg.clear_confirm': 'Êtes-vous sûr de vouloir effacer toutes les données de l\'application? Cette action ne peut pas être annulée.',
    'msg.data_cleared': 'Toutes les données ont été effacées avec succès!'
  }
};

interface TranslationProviderProps {
  children: ReactNode;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [language, setLanguage] = useState('French'); // Default to French as requested

  // Load language from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('atonda_app_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.language) {
        setLanguage(settings.language);
      }
    }
  }, []);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['English'][key] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}