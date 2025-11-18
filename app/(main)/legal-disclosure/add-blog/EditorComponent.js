import React, { use, useEffect, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import * as mammoth from "mammoth";
import axios from "axios";

const EditorComponent = ({ data, setEditorData }) => {
  const editorRef = useRef(null);
  const inputFile = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setContent(data || "");
    }
  }, [data]);

  const downloadword = async (htmlContent) => {
    try {
      const res = await axios.post(
        "/api/export-docx",
        { html: htmlContent },
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "document.docx";
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Error exporting docx:", err);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        mammoth
          .convertToHtml({ arrayBuffer })
          .then((result) => {
            if (editorRef.current) {
              editorRef.current.setContent(result.value);
            }
            setEditorData(result.value);
          })
          .catch((err) => {
            console.error("Error converting DOCX to HTML:", err);
          });
      };

      reader.readAsArrayBuffer(file);
    } else {
      alert("Please upload a valid DOCX file");
    }
  };

  const onButtonClick = () => {
    inputFile.current.click();
  };

  return (
    <div className="p-4 w-full mx-auto bg-white border border-gray-300 rounded-md shadow-xs">
      <input
        type="file"
        id="file"
        accept=".docx, .doc"
        ref={inputFile}
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        licenseKey="gpl"
        onInit={(_evt, editor) => (editorRef.current = editor)}
        initialValue={data}
        init={{
          selector: "textarea#open-source-plugins",
          plugins:
            "preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons accordion",
          editimage_cors_hosts: ["picsum.photos"],
          menubar: " edit view insert tools",
          menu: {},
          setup: function (editor) {},
          toolbar:
            "undo redo  | accordion accordionremove | blocks  fontsizeinput | bold italic underline strikethrough superscript subscript | align numlist bullist | link image | table media | lineheight outdent indent| forecolor backcolor removeformat | charmap emoticons | code  | ltr rtl | fullscreen preview ",
          image_advtab: true,
          link_list: [
            { title: "My page 1", value: "https://www.tiny.cloud" },
            { title: "My page 2", value: "http://www.moxiecode.com" },
          ],
          image_list: [
            { title: "My page 1", value: "https://www.tiny.cloud" },
            { title: "My page 2", value: "http://www.moxiecode.com" },
          ],
          image_class_list: [
            { title: "None", value: "" },
            { title: "Some class", value: "class-name" },
          ],
          importcss_append: true,
          file_picker_callback: (callback, value, meta) => {
            if (meta.filetype === "file") {
              callback("https://www.google.com/logos/google.jpg", {
                text: "My text",
              });
            }

            if (meta.filetype === "image") {
              callback("https://www.google.com/logos/google.jpg", {
                alt: "My alt text",
              });
            }

            if (meta.filetype === "media") {
              callback("movie.mp4", {
                source2: "alt.ogg",
                poster: "https://www.google.com/logos/google.jpg",
              });
            }
          },
          height: 600,
          image_caption: true,
          quickbars_selection_toolbar:
            "bold italic | quicklink h2 h3 blockquote quickimage quicktable",
          noneditable_class: "mceNonEditable",
          toolbar_mode: "sliding",
          contextmenu: "link image table",
          content_style:
            "body { font-family:Space Grotesk Variable,sans-serif; font-size:16px };",
          valid_elements: "*[*]",
          extended_valid_elements: "span[style|class],table[style|class]",
          inline_styles: true,
          promotion: false,
        }}
        onBlur={() => {
          if (editorRef.current) {
            setEditorData(editorRef.current.getContent());
          }
        }}
      />
    </div>
  );
};

export default EditorComponent;
