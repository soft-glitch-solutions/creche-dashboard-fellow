export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      application_documents: {
        Row: {
          application_id: string | null
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          application_id?: string | null
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          application_id?: string | null
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_notes: {
        Row: {
          application_id: string
          created_at: string | null
          id: string
          note: string
          user_id: string
        }
        Insert: {
          application_id: string
          created_at?: string | null
          id?: string
          note: string
          user_id: string
        }
        Update: {
          application_id?: string
          created_at?: string | null
          id?: string
          note?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_notes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_application"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          application_status: string | null
          created_at: string | null
          creche_id: string | null
          id: string
          lifecycle_stage: string | null
          message: string
          number_of_children: number | null
          parent_address: string | null
          parent_email: string
          parent_name: string
          parent_phone_number: string
          parent_whatsapp: string | null
          source: string
          submitted_at: string | null
          user_id: string | null
        }
        Insert: {
          application_status?: string | null
          created_at?: string | null
          creche_id?: string | null
          id?: string
          lifecycle_stage?: string | null
          message: string
          number_of_children?: number | null
          parent_address?: string | null
          parent_email: string
          parent_name: string
          parent_phone_number: string
          parent_whatsapp?: string | null
          source: string
          submitted_at?: string | null
          user_id?: string | null
        }
        Update: {
          application_status?: string | null
          created_at?: string | null
          creche_id?: string | null
          id?: string
          lifecycle_stage?: string | null
          message?: string
          number_of_children?: number | null
          parent_address?: string | null
          parent_email?: string
          parent_name?: string
          parent_phone_number?: string
          parent_whatsapp?: string | null
          source?: string
          submitted_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          hearts: number | null
          id: string
          latitude: number
          longitude: number
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          hearts?: number | null
          id?: string
          latitude: number
          longitude: number
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          hearts?: number | null
          id?: string
          latitude?: number
          longitude?: number
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_staff: {
        Row: {
          date: string
          id: string
          remarks: string | null
          staff_id: string | null
          status: string
        }
        Insert: {
          date: string
          id?: string
          remarks?: string | null
          staff_id?: string | null
          status: string
        }
        Update: {
          date?: string
          id?: string
          remarks?: string | null
          staff_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_staff_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_students: {
        Row: {
          attendance_date: string
          created_at: string | null
          id: string
          status: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          attendance_date: string
          created_at?: string | null
          id?: string
          status: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          attendance_date?: string
          created_at?: string | null
          id?: string
          status?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message: string | null
          last_message_time: string | null
          participant_1: string | null
          participant_2: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_time?: string | null
          participant_1?: string | null
          participant_2?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_time?: string | null
          participant_1?: string | null
          participant_2?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_participant_1_fkey"
            columns: ["participant_1"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_2_fkey"
            columns: ["participant_2"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      creche_classes: {
        Row: {
          color: string
          created_at: string | null
          creche_id: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          creche_id: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          creche_id?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creche_classes_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      creche_gallery: {
        Row: {
          caption: string | null
          created_at: string | null
          creche_id: string
          id: string
          image_url: string
          order_index: number | null
          updated_at: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          creche_id: string
          id?: string
          image_url: string
          order_index?: number | null
          updated_at?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          creche_id?: string
          id?: string
          image_url?: string
          order_index?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creche_gallery_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      creche_users: {
        Row: {
          creche_id: number
          role_id: number | null
          user_id: number
        }
        Insert: {
          creche_id: number
          role_id?: number | null
          user_id: number
        }
        Update: {
          creche_id?: number
          role_id?: number | null
          user_id?: number
        }
        Relationships: []
      }
      creches: {
        Row: {
          address: string | null
          capacity: number | null
          created_at: string | null
          description: string | null
          email: string | null
          facebook_url: string | null
          features: Json | null
          header_image: string | null
          id: string
          instagram_url: string | null
          latitude: number | null
          linkedin_url: string | null
          logo: string | null
          longitude: number | null
          monthly_price: number | null
          name: string
          operating_hours: string | null
          phone_number: string | null
          plan: string | null
          price: number | null
          registered: boolean | null
          telegram_number: string | null
          twitter_url: string | null
          updated_at: string | null
          website: string | null
          website_url: string | null
          weekly_price: number | null
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          features?: Json | null
          header_image?: string | null
          id?: string
          instagram_url?: string | null
          latitude?: number | null
          linkedin_url?: string | null
          logo?: string | null
          longitude?: number | null
          monthly_price?: number | null
          name: string
          operating_hours?: string | null
          phone_number?: string | null
          plan?: string | null
          price?: number | null
          registered?: boolean | null
          telegram_number?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          website?: string | null
          website_url?: string | null
          weekly_price?: number | null
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          features?: Json | null
          header_image?: string | null
          id?: string
          instagram_url?: string | null
          latitude?: number | null
          linkedin_url?: string | null
          logo?: string | null
          longitude?: number | null
          monthly_price?: number | null
          name?: string
          operating_hours?: string | null
          phone_number?: string | null
          plan?: string | null
          price?: number | null
          registered?: boolean | null
          telegram_number?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          website?: string | null
          website_url?: string | null
          weekly_price?: number | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          all_day: boolean | null
          color_code: string | null
          created_at: string | null
          creche_id: string | null
          description: string | null
          end_time: string
          id: string
          location: string | null
          meeting_link: string | null
          priority: string | null
          start: string
          title: string
          user_id: string | null
        }
        Insert: {
          all_day?: boolean | null
          color_code?: string | null
          created_at?: string | null
          creche_id?: string | null
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          meeting_link?: string | null
          priority?: string | null
          start: string
          title: string
          user_id?: string | null
        }
        Update: {
          all_day?: boolean | null
          color_code?: string | null
          created_at?: string | null
          creche_id?: string | null
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          meeting_link?: string | null
          priority?: string | null
          start?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      help_articles: {
        Row: {
          content: string
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      help_content: {
        Row: {
          category: Database["public"]["Enums"]["help_category"]
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["help_category"]
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["help_category"]
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          discount: number | null
          id: string
          invoice_id: string | null
          quantity: number
          title: string
          total_price: number
          unit_price: number
        }
        Insert: {
          discount?: number | null
          id?: string
          invoice_id?: string | null
          quantity: number
          title: string
          total_price: number
          unit_price: number
        }
        Update: {
          discount?: number | null
          id?: string
          invoice_id?: string | null
          quantity?: number
          title?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string | null
          creche_id: string | null
          id: string
          prepared_by: string | null
          prepared_for: string | null
          status: string | null
          student_id: string | null
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          title: string
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creche_id?: string | null
          id?: string
          prepared_by?: string | null
          prepared_for?: string | null
          status?: string | null
          student_id?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          title: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creche_id?: string | null
          id?: string
          prepared_by?: string | null
          prepared_for?: string | null
          status?: string | null
          student_id?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          title?: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_prepared_by_fkey"
            columns: ["prepared_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_types: {
        Row: {
          color: string
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lessons: {
        Row: {
          class_id: string
          created_at: string | null
          day_of_week: string
          end_time: string
          id: string
          lesson_type: string
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          day_of_week: string
          end_time: string
          id?: string
          lesson_type: string
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          day_of_week?: string
          end_time?: string
          id?: string
          lesson_type?: string
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "creche_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_lesson_type_fkey"
            columns: ["lesson_type"]
            isOneToOne: false
            referencedRelation: "lesson_types"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          conversation_id: string | null
          id: string
          message: string
          sender_id: string | null
          sent_at: string | null
        }
        Insert: {
          conversation_id?: string | null
          id?: string
          message: string
          sender_id?: string | null
          sent_at?: string | null
        }
        Update: {
          conversation_id?: string | null
          id?: string
          message?: string
          sender_id?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          deleted: boolean | null
          id: string
          message: string
          read_at: string | null
          sender_id: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          deleted?: boolean | null
          id?: string
          message: string
          read_at?: string | null
          sender_id?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          deleted?: boolean | null
          id?: string
          message?: string
          read_at?: string | null
          sender_id?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_sender_id_fkey1"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      photobook_entries: {
        Row: {
          caption: string | null
          created_at: string | null
          creche_id: string
          id: string
          image_url: string
          month: number
          updated_at: string | null
          year: number
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          creche_id: string
          id?: string
          image_url: string
          month: number
          updated_at?: string | null
          year: number
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          creche_id?: string
          id?: string
          image_url?: string
          month?: number
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "photobook_entries_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          id: string
          role_name: string
        }
        Insert: {
          id?: string
          role_name: string
        }
        Update: {
          id?: string
          role_name?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string | null
          creche_id: string | null
          email: string | null
          hire_date: string | null
          id: string
          name: string
          position: string
          qualification: string | null
          staff_number: number | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          creche_id?: string | null
          email?: string | null
          hire_date?: string | null
          id?: string
          name: string
          position: string
          qualification?: string | null
          staff_number?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          creche_id?: string | null
          email?: string | null
          hire_date?: string | null
          id?: string
          name?: string
          position?: string
          qualification?: string | null
          staff_number?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      student_documents: {
        Row: {
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          student_id: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          student_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          student_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          age: number | null
          application_id: string | null
          class: string | null
          created_at: string | null
          creche_id: string | null
          disabilities_allergies: string | null
          dob: string | null
          fees_owed: number | null
          fees_paid: number | null
          id: string
          name: string
          parent_email: string | null
          parent_name: string | null
          parent_phone_number: string | null
          parent_whatsapp: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          application_id?: string | null
          class?: string | null
          created_at?: string | null
          creche_id?: string | null
          disabilities_allergies?: string | null
          dob?: string | null
          fees_owed?: number | null
          fees_paid?: number | null
          id?: string
          name?: string
          parent_email?: string | null
          parent_name?: string | null
          parent_phone_number?: string | null
          parent_whatsapp?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          age?: number | null
          application_id?: string | null
          class?: string | null
          created_at?: string | null
          creche_id?: string | null
          disabilities_allergies?: string | null
          dob?: string | null
          fees_owed?: number | null
          fees_paid?: number | null
          id?: string
          name?: string
          parent_email?: string | null
          parent_name?: string | null
          parent_phone_number?: string | null
          parent_whatsapp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_requests: {
        Row: {
          category: string
          created_at: string | null
          id: number
          message: string
          status: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: number
          message: string
          status?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: number
          message?: string
          status?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: number
          ticket_id: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: number
          ticket_id: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: number
          ticket_id?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_creche: {
        Row: {
          creche_id: string
          user_id: string
        }
        Insert: {
          creche_id: string
          user_id: string
        }
        Update: {
          creche_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_creche_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_creche_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_likes: {
        Row: {
          article_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          article_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          article_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_likes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          bio: string | null
          city: string | null
          created_at: string | null
          display_name: string | null
          email: string
          first_name: string | null
          id: string
          id_number: string | null
          last_name: string | null
          latitude: string | null
          longitude: string | null
          phone_number: string | null
          price: string | null
          profile_picture_url: string | null
          province: string | null
          role_id: string | null
          suburb: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          first_name?: string | null
          id?: string
          id_number?: string | null
          last_name?: string | null
          latitude?: string | null
          longitude?: string | null
          phone_number?: string | null
          price?: string | null
          profile_picture_url?: string | null
          province?: string | null
          role_id?: string | null
          suburb?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          first_name?: string | null
          id?: string
          id_number?: string | null
          last_name?: string | null
          latitude?: string | null
          longitude?: string | null
          phone_number?: string | null
          price?: string | null
          profile_picture_url?: string | null
          province?: string | null
          role_id?: string | null
          suburb?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      help_category: "documentation" | "faq" | "tutorial"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
