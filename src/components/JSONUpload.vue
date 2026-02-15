<template>
  <div class="json-upload">
    <FileUpload
      ref="fileUploadRef"
      mode="advanced"
      name="jsonFile"
      accept="application/json"
      :maxFileSize="1000000"
      :chooseLabel="uploadLabel"
      cancelLabel="Clear"
      @select="uploader($event)"
      custom-upload
      :show-upload-button="false"
      dragDrop
      :multiple="multiple"
    />

    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script setup  lang="ts">
import { ref } from 'vue'
import FileUpload from 'primevue/fileupload'
import type { FileUploadSelectEvent } from 'primevue'

defineProps({
  uploadLabel: {
    type: String,
    required: true
  },
  multiple: {
    type: Boolean,
    required: true
  }

})

const emit = defineEmits(['json-loaded'])

const error = ref(null)

function uploader(event: FileUploadSelectEvent) {
    const files: Blob[] = event.files

    if (files && files.length === 0){
        return
    }

    files.map(file => {
        const reader = new FileReader()
        reader.readAsText(file)
        reader.onload = () => {
            const result = reader.result

            if (typeof result !== 'string'){
                console.error("File content not a string")
                return
            }
            emit('json-loaded', JSON.parse(result))
        }
        reader.onerror = (error) => console.log(error)
    }
    )
}
</script>

<style scoped>
.json-upload {
  max-width: 400px;
}

.error {
  margin-top: 1rem;
  color: #f44336;
}
</style>