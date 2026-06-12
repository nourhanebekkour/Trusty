<template>
  <component
    :is="iconComponent"
    class="app-icon"
    :size="size"
    :stroke-width="strokeWidth"
    aria-hidden="true"
  />
</template>

<script setup>
import { computed } from 'vue'
import {
  Activity, AlertCircle, AlertTriangle, Archive, Award, Bell, BookOpen,
  BriefcaseBusiness, Building2, CalendarDays, Camera, Check, CheckCircle2,
  ChevronDown, ChevronRight, CircleHelp, Clock3, Cloud, Code2, Crown,
  Database, Download, ExternalLink, Eye, File, FileArchive, FileImage,
  FileMusic, FileSpreadsheet, FileText, FileVideo, Folder, Gauge, Github,
  Globe2, GraduationCap, Hourglass, Image, Laptop, Lightbulb, Link2, Loader2,
  Lock, Mail, MapPin, MessageCircle, Microscope, Palette, Paperclip, Pencil,
  Phone, Plus, Quote, RefreshCw, Rocket, Save, Search, Settings, ShieldCheck,
  Smartphone, Sparkles, Star, Target, TestTube2, Trash2, Upload, User,
  UserCheck, Users, Wrench, X, XCircle, Zap,
} from 'lucide-vue-next'

const props = defineProps({
  name: { type: String, default: 'file' },
  size: { type: [Number, String], default: 18 },
  strokeWidth: { type: [Number, String], default: 2 },
})

const icons = {
  activity: Activity,
  alert: AlertCircle,
  warning: AlertTriangle,
  archive: Archive,
  award: Award,
  bell: Bell,
  book: BookOpen,
  briefcase: BriefcaseBusiness,
  building: Building2,
  calendar: CalendarDays,
  camera: Camera,
  check: Check,
  'check-circle': CheckCircle2,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  help: CircleHelp,
  clock: Clock3,
  cloud: Cloud,
  code: Code2,
  crown: Crown,
  database: Database,
  download: Download,
  'external-link': ExternalLink,
  eye: Eye,
  file: File,
  'file-archive': FileArchive,
  'file-image': FileImage,
  'file-music': FileMusic,
  'file-spreadsheet': FileSpreadsheet,
  'file-text': FileText,
  'file-video': FileVideo,
  folder: Folder,
  gauge: Gauge,
  github: Github,
  globe: Globe2,
  graduation: GraduationCap,
  hourglass: Hourglass,
  image: Image,
  laptop: Laptop,
  lightbulb: Lightbulb,
  link: Link2,
  loader: Loader2,
  lock: Lock,
  mail: Mail,
  map: MapPin,
  message: MessageCircle,
  microscope: Microscope,
  palette: Palette,
  paperclip: Paperclip,
  pencil: Pencil,
  phone: Phone,
  plus: Plus,
  quote: Quote,
  refresh: RefreshCw,
  rocket: Rocket,
  save: Save,
  search: Search,
  settings: Settings,
  shield: ShieldCheck,
  smartphone: Smartphone,
  sparkles: Sparkles,
  star: Star,
  target: Target,
  test: TestTube2,
  trash: Trash2,
  upload: Upload,
  user: User,
  'user-check': UserCheck,
  users: Users,
  wrench: Wrench,
  x: X,
  'x-circle': XCircle,
  zap: Zap,
}

const iconComponent = computed(() => icons[props.name] || File)
</script>

<style scoped>
.app-icon {
  display: inline-block;
  flex: 0 0 auto;
  vertical-align: -0.18em;
  color: currentColor;
}
</style>
